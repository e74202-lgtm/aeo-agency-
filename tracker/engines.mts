// Talks to OpenAI and Google with your secret API keys (read from .env.local).
// Adapted from the instant-snapshot code. Runs on your computer only.
import type { ClientConfig, Engine } from "./types.mts"

const TIMEOUT_MS = 60_000

export type EngineReply = { text: string; sources: string[]; demo: boolean }

export function engineIsLive(engine: Engine) {
  return engine === "chatgpt" ? Boolean(process.env.OPENAI_API_KEY) : Boolean(process.env.GEMINI_API_KEY)
}

export function hostname(url: string) {
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase()
  } catch {
    return url.toLowerCase()
  }
}

export async function askEngine(
  engine: Engine,
  prompt: string,
  client: ClientConfig,
  index: number,
  opts: { forceDemo?: boolean; brandChance?: number } = {},
): Promise<EngineReply> {
  if (opts.forceDemo || !engineIsLive(engine)) return { ...demoAnswer(engine, client, index, opts.brandChance), demo: true }
  const reply = engine === "chatgpt" ? await askChatGPT(prompt) : await askGemini(prompt)
  return { ...reply, demo: false }
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
  const sources: string[] = []
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue
    for (const part of item.content ?? []) {
      if (part.type !== "output_text") continue
      text += part.text ?? ""
      for (const a of part.annotations ?? []) {
        if (a.type === "url_citation" && a.url) sources.push(hostname(a.url))
      }
    }
  }
  return { text, sources: [...new Set(sources)] }
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
  // Gemini links go through a Google redirect; the title holds the real site's domain.
  const sources = (candidate?.groundingMetadata?.groundingChunks ?? [])
    .map((chunk) => chunk.web)
    .filter((web): web is { uri: string; title?: string } => Boolean(web?.uri))
    .map((web) => (web.title ? web.title.replace(/^www\./, "").toLowerCase() : hostname(web.uri)))
  return { text, sources: [...new Set(sources)] }
}

// --- Demo mode: fake answers so you can try the tracker before adding API keys -------------

const DEMO_SOURCES = ["reviews.example", "industry-roundup.example", "forum.example", "comparison.example", "news.example"]

export function demoAnswer(engine: Engine, client: ClientConfig, index: number, brandChance = 0.3) {
  const rivals = client.competitors.length ? client.competitors.map((c) => c.name) : ["Brightline", "Northstar", "Keystone"]
  const pick = (n: number) => rivals[(index + n + (engine === "gemini" ? 1 : 0)) % rivals.length]
  // Random each run, so week-to-week changes show up in the report.
  const includeBrand = Math.random() < brandChance
  const names = [...new Set([pick(0), pick(1), includeBrand ? client.name : pick(2)])]
  const text = `The names that come up most are ${names.join(", ")}. Compare a few options and check recent reviews.`
  const sources = [0, 1].map((n) => DEMO_SOURCES[(index + n + (engine === "gemini" ? 2 : 0)) % DEMO_SOURCES.length])
  if (Math.random() < 0.1) sources.push(hostname(client.website))
  return { text, sources }
}
