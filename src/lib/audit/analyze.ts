// Server-only: scores answers and (with an OpenAI key) writes the summary.
import { hostname } from "./engines"
import type { AuditInput, AuditSummary, EngineAnswer, Source } from "./types"

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export function siteDomain(website: string) {
  return hostname(/^https?:\/\//i.test(website) ? website : `https://${website}`)
}

export function isNamed(text: string, input: AuditInput) {
  const brand = new RegExp(`\\b${escapeRegExp(input.brand.trim())}\\b`, "i")
  return brand.test(text) || text.toLowerCase().includes(siteDomain(input.website))
}

export function isCited(sources: Source[], input: AuditInput) {
  const domain = siteDomain(input.website)
  return sources.some((s) => s.domain === domain || s.domain.endsWith(`.${domain}`))
}

function topSources(answers: EngineAnswer[], input: AuditInput) {
  const own = siteDomain(input.website)
  const counts = new Map<string, number>()
  for (const a of answers) {
    // Count each site once per answer
    for (const domain of new Set(a.sources.map((s) => s.domain))) {
      if (domain !== own) counts.set(domain, (counts.get(domain) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([domain, count]) => ({ domain, count }))
}

export async function summarize(input: AuditInput, answers: EngineAnswer[]): Promise<AuditSummary> {
  const ok = answers.filter((a) => !a.error)
  const sources = topSources(ok, input)
  const allDemo = ok.every((a) => a.demo)

  if (process.env.OPENAI_API_KEY && !allDemo) {
    try {
      return { topSources: sources, ...(await summarizeWithAI(input, ok, sources)) }
    } catch (err) {
      console.error("[audit] summary failed, using fallback", err)
    }
  }
  return { topSources: sources, ...fallbackSummary(input, ok, sources) }
}

type SummaryJSON = Pick<AuditSummary, "competitors" | "fixes">

async function summarizeWithAI(
  input: AuditInput,
  answers: EngineAnswer[],
  sources: AuditSummary["topSources"],
): Promise<SummaryJSON> {
  const transcript = answers
    .map((a, i) => `Answer ${i + 1}:\n${a.text.slice(0, 1500)}`)
    .join("\n\n")

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input:
        `You analyze AI search visibility. The brand is "${input.brand}" (${siteDomain(input.website)}), ` +
        `in the category "${input.category}". Below are AI answers to buyer questions.\n\n` +
        `1. List up to 6 other brands or companies recommended in these answers (never "${input.brand}"), ` +
        `with how many answers mention each, most-mentioned first.\n` +
        `2. Write exactly 3 specific, practical fixes that would get "${input.brand}" recommended more often. ` +
        `Where relevant, reference these frequently cited sources: ${sources.map((s) => s.domain).join(", ") || "none"}. ` +
        `Plain English, no guarantees, each detail at most 2 sentences.\n\n${transcript}`,
      text: {
        format: {
          type: "json_schema",
          name: "audit_summary",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["competitors", "fixes"],
            properties: {
              competitors: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["name", "mentions"],
                  properties: { name: { type: "string" }, mentions: { type: "integer" } },
                },
              },
              fixes: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["title", "detail"],
                  properties: { title: { type: "string" }, detail: { type: "string" } },
                },
              },
            },
          },
        },
      },
    }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`OpenAI summary ${res.status}`)
  const data = (await res.json()) as { output?: { type: string; content?: { type: string; text?: string }[] }[] }
  const raw = data.output
    ?.flatMap((o) => (o.type === "message" ? (o.content ?? []) : []))
    .find((c) => c.type === "output_text")?.text
  if (!raw) throw new Error("OpenAI summary: empty")
  const parsed = JSON.parse(raw) as SummaryJSON
  return { competitors: parsed.competitors.slice(0, 6), fixes: parsed.fixes.slice(0, 3) }
}

// Used in demo mode, or if the AI summary fails.
const DEMO_RIVALS = ["Brightline", "Summit & Co.", "Northstar", "Keystone Partners"]

function fallbackSummary(
  input: AuditInput,
  answers: EngineAnswer[],
  sources: AuditSummary["topSources"],
): SummaryJSON {
  const candidates = [...new Set([input.competitor?.trim(), ...DEMO_RIVALS].filter(Boolean) as string[])]
  const competitors = candidates
    .map((name) => ({
      name,
      mentions: answers.filter((a) => new RegExp(`\\b${escapeRegExp(name)}\\b`, "i").test(a.text)).length,
    }))
    .filter((c) => c.mentions > 0)
    .sort((a, b) => b.mentions - a.mentions)

  const [s1, s2] = sources
  const leader = competitors[0]
  const fixes = [
    s1 && {
      title: `Get featured on ${s1.domain}`,
      detail: `It was cited in ${s1.count} answers. Being mentioned there puts ${input.brand} in front of the engines directly.`,
    },
    s2 && {
      title: `Earn a mention on ${s2.domain}`,
      detail: `The second most-cited source in your category. A placement here compounds with the first.`,
    },
    leader
      ? {
          title: `Close the gap with ${leader.name}`,
          detail: `They were named in ${leader.mentions} answers. Find where they're mentioned and get ${input.brand} into the same places.`,
        }
      : {
          title: "Track this weekly",
          detail: "AI answers change week to week. Tracking the same questions shows what's working.",
        },
  ].filter(Boolean) as SummaryJSON["fixes"]

  return { competitors: competitors.slice(0, 6), fixes }
}
