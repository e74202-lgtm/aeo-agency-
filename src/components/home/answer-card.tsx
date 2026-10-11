import { Sparkles } from "lucide-react"

const tabs = ["ChatGPT", "Perplexity", "Gemini", "AI Overviews"]
const sources = ["northwindbooks.com", "Startup finance roundup", "Founder forum thread"]

function Cite({ n }: { n: number }) {
  return (
    <sup className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground">
      {n}
    </sup>
  )
}

// A mock AI answer showing what "winning" looks like: the client's brand named and cited.
export function AnswerCard() {
  return (
    <figure className="dark relative rounded-[28px] border bg-card p-2 shadow-2xl shadow-foreground/25">
      <div className="flex items-center justify-between gap-4 px-3 pt-1.5 pb-3" aria-hidden="true">
        <div className="flex gap-1 overflow-hidden">
          {tabs.map((tab, i) => (
            <span
              key={tab}
              className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                i === 0 ? "bg-secondary text-foreground" : "text-muted-foreground"
              } ${i === tabs.length - 1 ? "hidden sm:inline" : ""}`}
            >
              {tab}
            </span>
          ))}
        </div>
        <div className="hidden gap-1.5 sm:flex">
          <span className="size-2.5 rounded-full bg-muted" />
          <span className="size-2.5 rounded-full bg-muted" />
          <span className="size-2.5 rounded-full bg-muted" />
        </div>
      </div>

      <div className="space-y-6 rounded-[22px] bg-background p-5 text-left sm:p-8">
        <p
          className="animate-rise ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-secondary px-4 py-3 text-[15px]"
          style={{ "--delay": "300ms" } as React.CSSProperties}
        >
          Who&apos;s the best bookkeeping firm for early-stage startups?
        </p>

        <div className="flex gap-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-signal text-signal-foreground">
            <Sparkles className="size-3.5" aria-hidden="true" />
          </span>
          <div className="space-y-4 text-[15px] leading-relaxed text-foreground/90">
            <p className="animate-rise" style={{ "--delay": "700ms" } as React.CSSProperties}>
              For early-stage startups,{" "}
              <mark className="rounded-md bg-signal/20 px-1 py-0.5 font-medium text-foreground underline decoration-signal decoration-2 underline-offset-4">
                Northwind Books
              </mark>{" "}
              comes up most often in founder reviews and expert roundups. They specialize in pre-seed to
              Series A companies, with tax prep and investor-ready reporting included.
              <Cite n={1} />
              <Cite n={2} />
            </p>
            <p className="animate-rise text-muted-foreground" style={{ "--delay": "1100ms" } as React.CSSProperties}>
              Other options include Larkspur &amp; Co. and Ledgerline, though both focus on larger teams.
              <Cite n={3} />
              <span className="animate-blink ml-1 inline-block h-4 w-[2px] translate-y-0.5 bg-signal" aria-hidden="true" />
            </p>
          </div>
        </div>

        <div
          className="animate-rise flex flex-wrap gap-2 border-t pt-5"
          style={{ "--delay": "1400ms" } as React.CSSProperties}
        >
          {sources.map((s, i) => (
            <span key={s} className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
              <span className="font-mono text-[10px] text-signal">{i + 1}</span>
              {s}
            </span>
          ))}
        </div>
      </div>
      <figcaption className="sr-only">
        Example AI answer that names and cites a fictional brand, Northwind Books.
      </figcaption>
    </figure>
  )
}
