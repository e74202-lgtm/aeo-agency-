// Shared between the server route and the browser. No secrets in here.

export type Engine = "chatgpt" | "gemini"

export const ENGINES: Engine[] = ["chatgpt", "gemini"]

export const ENGINE_LABEL: Record<Engine, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini (with Google Search)",
}

export type AuditInput = {
  email: string
  brand: string
  website: string
  category: string
  competitor?: string
}

export type Source = { url: string; domain: string }

export type EngineAnswer = {
  engine: Engine
  promptIndex: number
  text: string
  sources: Source[]
  /** The brand appears in the answer text */
  named: boolean
  /** The brand's website is one of the cited sources */
  cited: boolean
  demo: boolean
  error?: string
}

export type AuditSummary = {
  competitors: { name: string; mentions: number }[]
  topSources: { domain: string; count: number }[]
  fixes: { title: string; detail: string }[]
}

/** One line of the streamed response (newline-delimited JSON). */
export type AuditEvent =
  | { type: "start"; prompts: string[]; demo: Record<Engine, boolean> }
  | { type: "answer"; answer: EngineAnswer }
  | { type: "summary"; summary: AuditSummary }
  | { type: "error"; message: string }
