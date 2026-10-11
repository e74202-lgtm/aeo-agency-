// Server-only: talks to OpenAI and Google with secret API keys. Never import from a client component.
import type { AuditInput, Engine, Source } from "./types"

const TIMEOUT_MS = 45_000

export function engineIsLive(engine: Engine) {
  return engine === "chatgpt" ? Boolean(process.env.OPENAI_API_KEY) : Boolean(process.env.GEMINI_API_KEY)
}

export async function askEngine(
  engine: Engine,
  prompt: string,
  input: AuditInput,
  index: number,
): Promise<{ text: string; sources: Source[]; demo: boolean }> {
  if (!engineIsLive(engine)) return { ...(await demoAnswer(engine, input, index)), demo: true }
  const result = engine === "chatgpt" ? await askChatGPT(prompt) : await askGemini(prompt)
  return { ...result, demo: false }
}

export function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

function dedupe(sources: Source[]) {
  const seen = new Set<string>()
  return sources.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)))
}

// --- OpenAI (Responses API with live web search) -------------------------------------------

type OpenAIResponse = {
  output?: {
    type: string
    content?: { type: string; text?: string; annotations?: { type: string; url?: string }[] }[]
  }[]
}

async function askChatGPT(prompt: string) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5-mini",
      input: prompt,
      tools: [{ type: "web_search" }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = (await res.json()) as OpenAIResponse

  let text = ""
  const sources: Source[] = []
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue
    for (const part of item.content ?? []) {
      if (part.type !== "output_text") continue
      text += part.text ?? ""
      for (const a of part.annotations ?? []) {
        if (a.type === "url_citation" && a.url) sources.push({ url: a.url, domain: hostname(a.url) })
      }
    }
  }
  return { text, sources: dedupe(sources) }
}

// --- Google Gemini (grounded with Google Search) ------------------------------------------

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] }
    groundingMetadata?: { groundingChunks?: { web?: { uri?: string; title?: string } }[] }
  }[]
}

async function askGemini(prompt: string) {
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash"
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": process.env.GEMINI_API_KEY ?? "", "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = (await res.json()) as GeminiResponse
  const candidate = data.candidates?.[0]

  const text = (candidate?.content?.parts ?? []).map((p) => p.text ?? "").join("")
  // Gemini links go through a Google redirect; the title holds the real site's domain.
  const sources: Source[] = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((chunk) => chunk.web)
    .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri))
    .map((web) => ({ url: web.uri, domain: (web.title || hostname(web.uri)).replace(/^www\./, "") }))
  return { text, sources: dedupe(sources) }
}

// --- Demo mode: realistic fake answers so the flow works before API keys exist ---------------

const DEMO_RIVALS = ["Brightline", "Summit & Co.", "Northstar", "Keystone Partners"]
const DEMO_SOURCES = ["reviews.example", "industry-roundup.example", "forum.example", "comparison.example"]

async function demoAnswer(engine: Engine, input: AuditInput, index: number) {
  await new Promise((r) => setTimeout(r, 700 + ((index * 7 + (engine === "gemini" ? 3 : 0)) % 9) * 250))

  const rivals = input.competitor?.trim() ? [input.competitor.trim(), ...DEMO_RIVALS.slice(0, 3)] : DEMO_RIVALS
  const pick = (n: number) => rivals[(index + n + (engine === "gemini" ? 1 : 0)) % rivals.length]
  // The brand shows up in roughly a quarter of answers, so the demo has something to fix.
  const includeBrand = (index + (engine === "gemini" ? 2 : 0)) % 4 === 0

  const names = [pick(0), pick(1), includeBrand ? input.brand.trim() : pick(2)]
  const text =
    `For ${input.category.trim()}, the names that come up most are ${names[0]}, ${names[1]} and ${names[2]}. ` +
    `${names[0]} is often praised in reviews for its service, while ${names[1]} is a popular pick for smaller teams. ` +
    `Compare a few options and check recent reviews before deciding.`
  const sources = [0, 1].map((n) => {
    const domain = DEMO_SOURCES[(index + n) % DEMO_SOURCES.length]
    return { url: `https://${domain}/`, domain }
  })
  return { text, sources }
}
