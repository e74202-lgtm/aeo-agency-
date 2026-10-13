// Talks to OpenAI, Google and Perplexity with your secret API keys (read from .env.local).
// Runs on your computer only.
import type { ClientConfig, Engine, Source } from "./types.mts"

const TIMEOUT_MS = 60_000

export type EngineReply = { text: string; sources: Source[]; demo: boolean }

const KEY_FOR: Record<Engine, string> = {
  chatgpt: "OPENAI_API_KEY",
  gemini: "GEMINI_API_KEY",
  perplexity: "PERPLEXITY_API_KEY",
}

export function engineIsLive(engine: Engine) {
  return Boolean(process.env[KEY_FOR[engine]])
}

export function hostname(url: string) {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

function dedupe(sources: Source[]) {
  const seen = new Set<string>()
  return sources.filter((s) => {
    const key = s.url || s.domain
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function askEngine(
  engine: Engine,
  prompt: string,
  client: ClientConfig,
  index: number,
  opts: { forceDemo?: boolean; brandChance?: number } = {},
): Promise<EngineReply> {
  if (opts.forceDemo || !engineIsLive(engine)) return { ...demoAnswer(engine, client, index, opts.brandChance), demo: true }
  const reply =
    engine === "chatgpt" ? await askChatGPT(prompt) : engine === "gemini" ? await askGemini(prompt) : await askPerplexity(prompt)
  return { ...reply, demo: false }
}

// --- OpenAI (Responses API with live web search) -------------------------------------------

type OpenAIResponse = {
  output?: {
    type: string
    content?: { type: string; text?: string; annotations?: { type: string; url?: string; title?: string }[] }[]
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
        if (a.type === "url_citation" && a.url) sources.push({ url: a.url, title: a.title ?? "", domain: hostname(a.url) })
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
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], tools: [{ google_search: {} }] }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = (await res.json()) as GeminiResponse
  const candidate = data.candidates?.[0]

  const text = (candidate?.content?.parts ?? []).map((p) => p.text ?? "").join("")
  // Gemini links go through a Google redirect (which can expire); the title holds the real site's domain.
  const sources = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((chunk) => chunk.web)
    .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri))
    .map((web) => ({
      url: web.uri,
      title: web.title ?? "",
      domain: web.title ? web.title.replace(/^www\./, "").toLowerCase() : hostname(web.uri),
    }))
  return { text, sources: dedupe(sources) }
}

// --- Perplexity (Sonar API, always cites sources) ------------------------------------------

type PerplexityResponse = {
  choices?: { message?: { content?: string } }[]
  citations?: string[]
  search_results?: { title?: string; url?: string }[]
}

async function askPerplexity(prompt: string) {
  const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.PERPLEXITY_MODEL || "sonar",
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`Perplexity ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = (await res.json()) as PerplexityResponse

  const text = data.choices?.[0]?.message?.content ?? ""
  const results = data.search_results?.filter((r): r is { url: string; title?: string } => Boolean(r.url))
  const sources: Source[] = results?.length
    ? results.map((r) => ({ url: r.url, title: r.title ?? "", domain: hostname(r.url) }))
    : (data.citations ?? []).map((url) => ({ url, title: "", domain: hostname(url) }))
  return { text, sources: dedupe(sources) }
}

// --- Demo mode: fake answers so you can try the tracker before adding API keys -------------

const DEMO_SITES = [
  { domain: "reviews.example", kind: "Best {c}s: reviews and ratings" },
  { domain: "industry-roundup.example", kind: "The top {c}s this year" },
  { domain: "forum.example", kind: "Thread: which {c} do you use?" },
  { domain: "comparison.example", kind: "{c} comparison guide" },
  { domain: "news.example", kind: "How to choose a {c}" },
]

export function demoAnswer(engine: Engine, client: ClientConfig, index: number, brandChance = 0.3) {
  const e = ENGINE_OFFSET[engine]
  const rivals = client.competitors.length ? client.competitors.map((c) => c.name) : ["Brightline", "Northstar", "Keystone"]
  const pick = (n: number) => rivals[(index + n + e) % rivals.length]
  // Random each run, so week-to-week changes show up in the report.
  const includeBrand = Math.random() < brandChance
  const names = [...new Set([pick(0), pick(1), includeBrand ? client.name : pick(2)])]
  const text = `The names that come up most are ${names.join(", ")}. Compare a few options and check recent reviews.`

  const category = client.category || "provider"
  const sources: Source[] = [0, 1].map((n) => {
    const site = DEMO_SITES[(index + n + e) % DEMO_SITES.length]
    const page = (index + n) % 4
    return {
      url: `https://${site.domain}/${category.replace(/\s+/g, "-")}-${page}`,
      title: site.kind.replace("{c}", category),
      domain: site.domain,
    }
  })
  if (Math.random() < 0.1) sources.push({ url: `https://${hostname(client.website)}/`, title: client.name, domain: hostname(client.website) })
  return { text, sources }
}

const ENGINE_OFFSET: Record<Engine, number> = { chatgpt: 0, gemini: 1, perplexity: 2 }
