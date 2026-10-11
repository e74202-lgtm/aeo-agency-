"use client"

import { useRef, useState } from "react"
import { ArrowRight, Check, CircleAlert, ExternalLink, LoaderCircle, Minus, RotateCcw } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OriginButton } from "@/components/ui/origin-button"
import {
  ENGINE_LABEL,
  ENGINES,
  type AuditEvent,
  type AuditSummary,
  type Engine,
  type EngineAnswer,
} from "@/lib/audit/types"

type Field = "email" | "brand" | "website" | "category"
type Errors = Partial<Record<Field, string>>
type Phase = "form" | "running" | "done"

const inputClass = "h-12 rounded-xl bg-card px-4 text-base md:text-base"

function validate(data: FormData): Errors {
  const get = (k: string) => String(data.get(k) ?? "").trim()
  const errors: Errors = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(get("email"))) errors.email = "Enter a valid work email, like you@yourbrand.com."
  if (!get("brand")) errors.brand = "Add your brand name, exactly as customers would say it."
  if (!/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(get("website"))) errors.website = "Enter a site like yourbrand.com."
  if (!get("category")) errors.category = "Tell us what you sell, e.g. “bookkeeping for startups”."
  return errors
}

// Engines answer in Markdown; we show plain text, so strip the common symbols.
function plain(text: string) {
  return text
    .replace(/\*\*|__/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1")
    .trim()
}

const key = (engine: Engine, promptIndex: number) => `${engine}:${promptIndex}`

export function InstantAudit() {
  const formRef = useRef<HTMLFormElement>(null)
  const [errors, setErrors] = useState<Errors>({})
  const [phase, setPhase] = useState<Phase>("form")
  const [failure, setFailure] = useState<string | null>(null)
  const [brand, setBrand] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [demo, setDemo] = useState<Record<Engine, boolean> | null>(null)
  const [answers, setAnswers] = useState<Record<string, EngineAnswer>>({})
  const [summary, setSummary] = useState<AuditSummary | null>(null)

  function onBlur(field: Field) {
    if (!formRef.current) return
    const fieldError = validate(new FormData(formRef.current))[field]
    setErrors((prev) => ({ ...prev, [field]: fieldError }))
  }

  function reset() {
    setPhase("form")
    setFailure(null)
    setPrompts([])
    setAnswers({})
    setSummary(null)
    setDemo(null)
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const found = validate(data)
    setErrors(found)
    const firstInvalid = (Object.keys(found) as Field[])[0]
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
      return
    }

    setFailure(null)
    setBrand(String(data.get("brand")).trim())
    setPhase("running")

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data)),
      })
      if (!res.ok || !res.body) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(error || "Something went wrong. Please try again.")
      }

      // The server streams one JSON event per line as each answer comes in.
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      let finished = false
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          if (!line.trim()) continue
          const e = JSON.parse(line) as AuditEvent
          if (e.type === "start") {
            setPrompts(e.prompts)
            setDemo(e.demo)
          } else if (e.type === "answer") {
            setAnswers((prev) => ({ ...prev, [key(e.answer.engine, e.answer.promptIndex)]: e.answer }))
          } else if (e.type === "summary") {
            setSummary(e.summary)
            finished = true
          } else if (e.type === "error") {
            throw new Error(e.message)
          }
        }
      }
      if (!finished) throw new Error("The snapshot was interrupted. Please try again.")
      setPhase("done")
    } catch (err) {
      setFailure(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setPhase("form")
    }
  }

  if (phase === "running") {
    return <Running prompts={prompts} answers={answers} />
  }
  if (phase === "done" && summary) {
    return <Results brand={brand} prompts={prompts} answers={answers} summary={summary} demo={demo} onReset={reset} />
  }

  const describedBy = (f: Field) => (errors[f] ? `ia-${f}-error` : undefined)
  const field = (f: Field, label: string, props: React.ComponentProps<typeof Input>) => (
    <div className="space-y-2">
      <Label htmlFor={`ia-${f}`} className="text-sm">
        {label} <span className="text-signal" aria-hidden="true">*</span>
      </Label>
      <Input
        id={`ia-${f}`}
        name={f}
        required
        aria-invalid={!!errors[f]}
        aria-describedby={describedBy(f)}
        onBlur={() => onBlur(f)}
        className={inputClass}
        {...props}
      />
      {errors[f] && (
        <p id={`ia-${f}-error`} className="flex items-start gap-1.5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errors[f]}
        </p>
      )}
    </div>
  )

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        {field("brand", "Brand name", { autoComplete: "organization", placeholder: "Northwind Books" })}
        {field("website", "Website", { inputMode: "url", autoComplete: "url", placeholder: "yourbrand.com" })}
      </div>
      {field("category", "What do you sell?", { placeholder: "bookkeeping for startups" })}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="ia-competitor" className="text-sm">
            Top competitor <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input id="ia-competitor" name="competitor" placeholder="Their brand name" className={inputClass} />
        </div>
        {field("email", "Work email", { type: "email", autoComplete: "email" })}
      </div>

      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      {failure && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          {failure}
        </p>
      )}

      <OriginButton type="submit" variant="primary" className="group w-full">
        Run my free AI snapshot
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </OriginButton>
      <p className="text-center text-sm text-muted-foreground">
        Takes about a minute. Free, no obligation.
      </p>
    </form>
  )
}

// --- Live progress -------------------------------------------------------------------------

function Running({ prompts, answers }: { prompts: string[]; answers: Record<string, EngineAnswer> }) {
  const total = prompts.length * ENGINES.length || 16
  const done = Object.keys(answers).length

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p role="status" aria-live="polite" className="flex items-center gap-2 font-medium">
          <LoaderCircle className="size-4 animate-spin text-signal" aria-hidden="true" />
          Asking ChatGPT and Gemini your buyers&apos; questions… {done} of {total}
        </p>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full rounded-full bg-signal transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
        </div>
      </div>

      <ul className="divide-y rounded-2xl border bg-card">
        {prompts.length === 0 && <li className="p-4 text-sm text-muted-foreground">Writing your buyer questions…</li>}
        {prompts.map((prompt, i) => (
          <li key={prompt} className="flex items-center justify-between gap-4 p-4 text-sm">
            <span className="min-w-0">{prompt}</span>
            <span className="flex shrink-0 gap-3">
              {ENGINES.map((engine) => (
                <StatusDot key={engine} engine={engine} answer={answers[key(engine, i)]} />
              ))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function StatusDot({ engine, answer }: { engine: Engine; answer?: EngineAnswer }) {
  const label = engine === "chatgpt" ? "GPT" : "Gem"
  const state = !answer ? "waiting" : answer.error ? "error" : answer.named ? "named" : "not named"
  return (
    <span
      title={`${ENGINE_LABEL[engine]}: ${state}`}
      className={`inline-flex min-w-14 items-center justify-center gap-1 rounded-full border px-2 py-1 font-mono text-[10px] uppercase ${
        state === "named" ? "border-signal/30 bg-signal/10 text-signal" : "text-muted-foreground"
      }`}
    >
      {!answer ? (
        <LoaderCircle className="size-3 animate-spin" aria-hidden="true" />
      ) : answer.named ? (
        <Check className="size-3" aria-hidden="true" />
      ) : (
        <Minus className="size-3" aria-hidden="true" />
      )}
      {label}
      <span className="sr-only">{state}</span>
    </span>
  )
}

// --- Results -------------------------------------------------------------------------------

function Results({
  brand,
  prompts,
  answers,
  summary,
  demo,
  onReset,
}: {
  brand: string
  prompts: string[]
  answers: Record<string, EngineAnswer>
  summary: AuditSummary
  demo: Record<Engine, boolean> | null
  onReset: () => void
}) {
  const all = Object.values(answers).filter((a) => !a.error)
  const named = all.filter((a) => a.named).length
  const perEngine = ENGINES.map((engine) => {
    const list = all.filter((a) => a.engine === engine)
    return { engine, named: list.filter((a) => a.named).length, total: list.length }
  })
  const demoEngines = ENGINES.filter((e) => demo?.[e])

  return (
    <div className="space-y-10">
      {demoEngines.length > 0 && (
        <p className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Demo mode:</strong> sample answers for{" "}
          {demoEngines.map((e) => ENGINE_LABEL[e]).join(" and ")}. Real answers appear once API keys are added.
        </p>
      )}

      <div className="space-y-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Your instant snapshot</p>
          <h3 className="mt-2 font-display text-3xl leading-tight font-semibold tracking-[-0.03em] sm:text-4xl">
            {brand} was named in <span className="text-signal">{named}</span> of {all.length} answers.
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {perEngine.map((e) => (
            <div key={e.engine} className="rounded-2xl border bg-card p-5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="font-medium">{ENGINE_LABEL[e.engine]}</span>
                <span className="font-mono tabular-nums">
                  {e.named}/{e.total}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                <div className="h-full rounded-full bg-signal" style={{ width: `${e.total ? (e.named / e.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h4 className="font-medium">Who AI recommends instead</h4>
          {summary.competitors.length ? (
            <ul className="space-y-2">
              {summary.competitors.map((c) => (
                <li key={c.name} className="flex items-center justify-between rounded-xl border bg-card px-4 py-2.5 text-sm">
                  {c.name}
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{c.mentions} answers</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No clear competitors stood out.</p>
          )}
        </div>
        <div className="space-y-4">
          <h4 className="font-medium">Sources AI trusts in your category</h4>
          {summary.topSources.length ? (
            <ul className="space-y-2">
              {summary.topSources.map((s) => (
                <li key={s.domain} className="flex items-center justify-between rounded-xl border bg-card px-4 py-2.5 text-sm">
                  <span className="min-w-0 truncate">{s.domain}</span>
                  <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">cited {s.count}×</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">The engines didn&apos;t cite specific sources.</p>
          )}
          <p className="text-xs text-muted-foreground">Getting mentioned on these sites is the fastest way into the answers.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Your top fixes</h4>
        <ol className="space-y-3">
          {summary.fixes.map((f, i) => (
            <li key={f.title} className="flex gap-4 rounded-2xl border bg-card p-5">
              <span className="font-mono text-sm text-signal">0{i + 1}</span>
              <div className="space-y-1">
                <p className="font-medium">{f.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Every answer</h4>
        <div className="divide-y rounded-2xl border bg-card">
          {prompts.map((prompt, i) => (
            <div key={prompt} className="p-4">
              <p className="text-sm font-medium">{prompt}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {ENGINES.map((engine) => (
                  <AnswerCell key={engine} engine={engine} answer={answers[key(engine, i)]} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium">Want this tracked every week, and fixed?</p>
          <p className="text-sm text-muted-foreground">Monitor tracks 150 prompts weekly. Growth earns the placements.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <OriginButton href="/pricing" variant="primary" className="h-11 px-5 text-sm">
            See plans
          </OriginButton>
          <OriginButton onClick={onReset} className="h-11 px-4 text-sm" aria-label="Run another snapshot">
            <RotateCcw className="size-4" aria-hidden="true" />
          </OriginButton>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Instant snapshot from the official ChatGPT and Gemini APIs, with web search on. Answers can vary from run to
        run and may differ slightly from what you see in the apps.
      </p>
    </div>
  )
}

function AnswerCell({ engine, answer }: { engine: Engine; answer?: EngineAnswer }) {
  if (!answer || answer.error) {
    return (
      <div className="rounded-xl border border-dashed p-3 text-xs text-muted-foreground">
        {ENGINE_LABEL[engine]}: no answer this time.
      </div>
    )
  }
  return (
    <details className="group rounded-xl border p-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-xs [&::-webkit-details-marker]:hidden">
        <span className="text-muted-foreground">{ENGINE_LABEL[engine]}</span>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${answer.named ? "bg-signal/10 text-signal" : "bg-muted text-muted-foreground"}`}>
          {answer.named ? <Check className="size-3" aria-hidden="true" /> : <Minus className="size-3" aria-hidden="true" />}
          {answer.named ? "Named" : "Not named"}
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{plain(answer.text).slice(0, 1200)}</p>
      {answer.sources.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {answer.sources.slice(0, 5).map((s) => (
            <li key={s.url}>
              {/^https?:\/\//.test(s.url) && !answer.demo ? (
                <a
                  href={s.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  {s.domain}
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              ) : (
                <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">{s.domain}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </details>
  )
}
