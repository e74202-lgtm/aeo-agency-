import { isCited, isNamed, summarize } from "@/lib/audit/analyze"
import { askEngine, engineIsLive } from "@/lib/audit/engines"
import { buildPrompts } from "@/lib/audit/prompts"
import { allow, withinDailyCap } from "@/lib/audit/rate-limit"
import { ENGINES, type AuditEvent, type AuditInput, type EngineAnswer } from "@/lib/audit/types"

export const runtime = "nodejs"
// 16 web-search answers run in parallel; give them room to finish.
export const maxDuration = 60

// Looser on your own machine so local testing isn't blocked (every local request shares one address).
const LIMITS =
  process.env.NODE_ENV === "production" ? { perEmail: 2, perIp: 5 } : { perEmail: 50, perIp: 200 }

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return bad("Invalid request.")
  }

  // Honeypot: real people never fill this hidden field.
  if (clean(body._gotcha, 200)) return bad("Invalid request.")

  const input: AuditInput = {
    email: clean(body.email, 200).toLowerCase(),
    brand: clean(body.brand, 80),
    website: clean(body.website, 200),
    category: clean(body.category, 120),
    competitor: clean(body.competitor, 80) || undefined,
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return bad("Please enter a valid email.")
  if (!input.brand) return bad("Please enter your brand name.")
  if (!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(input.website)) return bad("Please enter a website like yourbrand.com.")
  if (!input.category) return bad("Please tell us what you sell.")

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (!allow(`email:${input.email}`, LIMITS.perEmail) || !allow(`ip:${ip}`, LIMITS.perIp)) {
    return bad("You've run the free snapshot a few times today. Try again tomorrow, or request a full audit below.", 429)
  }
  const anyLive = ENGINES.some(engineIsLive)
  if (anyLive && !withinDailyCap()) {
    return bad("We've hit today's limit for instant snapshots. Request a full audit below and we'll run it for you.", 429)
  }

  const prompts = buildPrompts(input)
  const demo = Object.fromEntries(ENGINES.map((e) => [e, !engineIsLive(e)])) as Record<(typeof ENGINES)[number], boolean>
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AuditEvent) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"))
      send({ type: "start", prompts, demo })

      const answers = await Promise.all(
        prompts.flatMap((prompt, promptIndex) =>
          ENGINES.map(async (engine): Promise<EngineAnswer> => {
            let answer: EngineAnswer
            try {
              const { text, sources, demo: isDemo } = await askEngine(engine, prompt, input, promptIndex)
              answer = {
                engine,
                promptIndex,
                text,
                sources,
                named: isNamed(text, input),
                cited: isCited(sources, input),
                demo: isDemo,
              }
            } catch (err) {
              // Log the details for us; show the visitor a plain message.
              console.error(`[audit] ${engine} failed`, err)
              answer = { engine, promptIndex, text: "", sources: [], named: false, cited: false, demo: false, error: "No answer" }
            }
            send({ type: "answer", answer })
            return answer
          }),
        ),
      )

      if (answers.every((a) => a.error)) {
        send({ type: "error", message: "The AI engines didn't respond. Please try again in a few minutes." })
      } else {
        send({ type: "summary", summary: await summarize(input, answers) })
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  })
}
