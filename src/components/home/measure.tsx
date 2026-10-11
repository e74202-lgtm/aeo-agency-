import { Check } from "lucide-react"

import { SectionLabel } from "@/components/home/section-label"

// Illustrative numbers only, clearly labeled on the page. Swap for a real case study later.
const bars = [
  { name: "You", value: 64, you: true },
  { name: "Competitor A", value: 41 },
  { name: "Competitor B", value: 27 },
  { name: "Competitor C", value: 12 },
]

const points = [
  "A fixed set of buyer prompts, tested every month",
  "Every major engine, tracked side by side",
  "You vs your top competitors, not vanity metrics",
  "Traffic and leads AI engines send your way",
]

export function Measure() {
  return (
    <section className="dark">
      <div className="mx-auto grid max-w-6xl gap-16 px-5 py-24 md:py-32 lg:grid-cols-2 lg:items-center">
        <div className="reveal space-y-6">
          <SectionLabel>What we measure</SectionLabel>
          <h2 className="font-serif text-5xl leading-[1] tracking-[-0.015em] text-balance md:text-6xl">
            Share of answer, <em className="text-signal">not guesswork.</em>
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
            One number that tells you how often AI recommends you instead of the competition, reported every
            month in plain English.
          </p>
          <ul className="space-y-3 pt-2">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-[15px]">
                <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <figure className="reveal rounded-3xl border bg-card p-7 sm:p-9">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-sm text-muted-foreground">Share of answer, 40 buyer prompts</p>
            <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
              Illustrative
            </span>
          </div>
          <dl className="mt-8 space-y-5">
            {bars.map((bar) => (
              <div key={bar.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <dt className={bar.you ? "font-medium" : "text-muted-foreground"}>{bar.name}</dt>
                  <dd className="font-mono tabular-nums">{bar.value}%</dd>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-secondary" aria-hidden="true">
                  <div
                    className={`h-full rounded-full ${bar.you ? "bg-signal" : "bg-muted-foreground/40"}`}
                    style={{ width: `${bar.value}%` }}
                  />
                </div>
              </div>
            ))}
          </dl>
          <figcaption className="mt-8 border-t pt-5 text-sm text-muted-foreground">
            How often each brand is named when buyers ask AI for a recommendation in your category.
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
