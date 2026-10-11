// Shapes used across the tracker. Kept to plain, erasable TypeScript so Node can run it directly.

export type Engine = "chatgpt" | "gemini"

export const ENGINES: Engine[] = ["chatgpt", "gemini"]

export const ENGINE_LABEL: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini (with Google Search)",
}

/** One client's settings: tracker/clients/<slug>.json */
export type ClientConfig = {
  name: string
  website: string
  /** Other ways people write the brand, e.g. "Northwind" for "Northwind Books" */
  aliases?: string[]
  competitors: { name: string; aliases?: string[] }[]
  /** The buyer questions to track (150 on the Monitor plan) */
  prompts: string[]
}

export type Answer = {
  promptIndex: number
  prompt: string
  engine: Engine
  ok: boolean
  demo: boolean
  /** The client's brand appears in the answer */
  named: boolean
  /** The client's website is one of the cited sources */
  cited: boolean
  /** Competitors named in the answer */
  competitors: string[]
  /** Domains the engine cited */
  sources: string[]
  /** Kept (shortened) so you can look back at what was said */
  text: string
}

export type Summary = {
  promptCount: number
  /** Prompts where at least one engine named the client */
  namedPrompts: number
  perEngine: Record<Engine, { named: number; total: number }>
  /** Answers that cited the client's own website */
  citedAnswers: number
  competitors: { name: string; answers: number }[]
  topSources: { domain: string; count: number }[]
  failed: number
  demo: boolean
}

export type RunResult = {
  client: string
  date: string
  answers: Answer[]
  summary: Summary
}
