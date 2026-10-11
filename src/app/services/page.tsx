import type { Metadata } from "next"
import { ArrowRight, Bell, Check, Minus, Plus } from "lucide-react"

import { FinalCta } from "@/components/home/final-cta"
import { SectionLabel } from "@/components/home/section-label"
import { OriginButton } from "@/components/ui/origin-button"
import { site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Services",
  description:
    "AEO services: we measure how often AI engines recommend your brand, earn the placements that change it, and keep you there.",
}

type Service = { name: string; body: string; plan: string }

const pillars: { id: string; label: string; title: string; intro: string; services: Service[] }[] = [
  {
    id: "measure",
    label: "01 · Measure",
    title: "Know exactly where AI recommends you.",
    intro: "You can't fix what you can't see. We track the questions your buyers ask, every week, across every major engine.",
    services: [
      { name: "AI visibility audit", body: "A one-time snapshot of where you're named, where competitors are named instead, and why.", plan: "Free" },
      { name: "Weekly prompt runs", body: "Your buyer questions, asked across ChatGPT, Perplexity, Gemini and Google AI Overviews every week.", plan: "Monitor+" },
      { name: "“Named in X of 150” report", body: "One clear number for how often you're recommended, tracked over time.", plan: "Monitor+" },
      { name: "Competitor alerts", body: "A heads-up the moment a competitor starts showing up in your answers.", plan: "Monitor+" },
      { name: "Prompt list tuning", body: "We refine your question list every month as your market and buyers shift.", plan: "Growth+" },
    ],
  },
  {
    id: "earn",
    label: "02 · Earn",
    title: "Get mentioned where AI looks for answers.",
    intro: "AI engines recommend brands that trusted sources talk about. We go after those sources for you, every month, and track what gets picked up.",
    services: [
      { name: "Citation building", body: "Monthly outreach to the roundups, review sites, comparisons and threads AI engines cite most, to get you mentioned there. Scale gets twice the outreach.", plan: "Growth+" },
      { name: "Citation tracking", body: "See every time an engine cites you, right in your weekly report.", plan: "Growth+" },
      { name: "Sponsored placements (optional)", body: "Featured listings or sponsored articles on high-value sources, paid from a separate budget you approve one by one. Always labeled as sponsored.", plan: "Growth+" },
      { name: "Original stat or data piece", body: "A small piece of original research about your category. Unique numbers attract citations.", plan: "Scale" },
    ],
  },
  {
    id: "maintain",
    label: "03 · Maintain",
    title: "Stay the answer once you've won it.",
    intro: "AI answers shift as new sources appear. We keep your placements fresh and your strategy current, so you don't slip.",
    services: [
      { name: "90-day refresh", body: "Older placements get updated so they stay current and keep getting picked up.", plan: "Growth+" },
      { name: "Fortnightly strategy call", body: "Every two weeks: what moved, what's next, and where to focus.", plan: "Scale" },
    ],
  },
]

const fit = {
  yes: [
    "Your buyers research before they buy",
    "You compete in a category people ask AI about",
    "You want a number you can track, not vague “awareness”",
  ],
  no: [
    "You need results by next week",
    "You're looking for paid ads or social media management",
    "You want someone to promise guaranteed rankings",
  ],
}

const faqs = [
  {
    q: "Can you guarantee AI will recommend us?",
    a: "No, and be wary of anyone who does. Nobody controls what AI engines say. What we guarantee is the work: the prompt runs, the placements, and an honest report on what's moving.",
  },
  {
    q: "How long until we see a change?",
    a: "Placements usually take two to three months to show up consistently in AI answers, as engines discover and trust the new sources. You'll see the trend in your weekly report long before that.",
  },
  {
    q: "Where do placements come from?",
    a: "Sources AI engines already read and trust in your category: industry roundups, review and comparison sites, and active community threads. We pick them based on what your prompt runs show engines are citing.",
  },
  {
    q: "Do I need the free audit first?",
    a: "Yes. The audit shows where you stand and which plan makes sense, so you're never paying for work you don't need.",
  },
]

const reportWeeks = [18, 21, 24, 29, 33, 38, 42, 47]

export default function ServicesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:pt-24">
        <div className="max-w-3xl space-y-6">
          <SectionLabel>Services</SectionLabel>
          <h1 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            We measure where AI recommends you, then <em className="text-signal">earn the mentions that change it.</em>
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Three parts, one goal: more of your buyers&apos; AI answers naming you. Here&apos;s everything we do and which
            plan it comes with.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <OriginButton href={site.cta.href} variant="primary" className="group px-6">
              Get your free AI visibility audit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </OriginButton>
            <OriginButton href="/pricing" className="px-6">
              See pricing
            </OriginButton>
          </div>
        </div>

        <nav aria-label="Service areas" className="mt-14 flex flex-wrap gap-2">
          {pillars.map((p) => (
            <a key={p.id} href={`#${p.id}`} className="rounded-full border bg-card px-4 py-2 text-sm transition-colors hover:border-signal hover:text-signal">
              {p.label}
            </a>
          ))}
        </nav>
      </section>

      {pillars.map((pillar, i) => (
        <section key={pillar.id} id={pillar.id} className="scroll-mt-16 border-t">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:py-24 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-6">
              <p className="font-mono text-sm text-signal">{pillar.label}</p>
              <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
                {pillar.title}
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">{pillar.intro}</p>
              {i === 0 && <ReportPreview />}
              {i === 1 && <PlacementPreview />}
            </div>

            <ul className="divide-y self-start border-y">
              {pillar.services.map((s) => (
                <li key={s.name} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-medium">{s.name}</h3>
                    <p className="leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                  <span className="w-fit shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                    {s.plan}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="dark">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <div className="max-w-2xl space-y-6">
            <SectionLabel>Is this for you?</SectionLabel>
            <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl">
              A good fit, and an honest not.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <FitList title="Great fit if" items={fit.yes} good />
            <FitList title="Not a fit if" items={fit.no} />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
        <div className="space-y-6">
          <SectionLabel>Questions</SectionLabel>
          <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.04em] sm:text-4xl">
            Before you ask.
          </h2>
        </div>
        <div className="border-t">
          {faqs.map((item) => (
            <details key={item.q} className="group border-b">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium transition-colors hover:text-signal [&::-webkit-details-marker]:hidden">
                <h3>{item.q}</h3>
                <Plus className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <p className="max-w-2xl pb-6 leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <FinalCta />
    </>
  )
}

// Example of the weekly report a Monitor client receives. Illustrative numbers, labeled on screen.
function ReportPreview() {
  const max = Math.max(...reportWeeks)
  return (
    <figure className="dark rounded-3xl border bg-card p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">This week</p>
          <p className="mt-1 font-display text-3xl font-semibold tracking-[-0.03em]">
            Named in <span className="text-signal">47</span> of 150 prompts
          </p>
        </div>
        <span className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
          Example
        </span>
      </div>
      <div className="mt-6 flex h-24 items-end gap-2" aria-hidden="true">
        {reportWeeks.map((v, i) => (
          <div
            key={i}
            className={`flex-1 rounded-t-md ${i === reportWeeks.length - 1 ? "bg-signal" : "bg-muted-foreground/30"}`}
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-secondary p-3 text-sm">
        <Bell className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
        <span>Competitor alert: a rival appeared in 6 new answers this week.</span>
      </div>
      <figcaption className="sr-only">
        Example weekly report: named in 47 of 150 prompts, up from 18 eight weeks ago, with a competitor alert.
      </figcaption>
    </figure>
  )
}

function PlacementPreview() {
  const rows = [
    { source: "Industry roundup", status: "Placed" },
    { source: "Comparison site", status: "Placed" },
    { source: "Community thread", status: "Refreshed" },
    { source: "Review site", status: "In progress" },
  ]
  return (
    <figure className="rounded-3xl border bg-card p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">This month&apos;s placements</p>
        <span className="rounded-full border px-2.5 py-1 font-mono text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
          Example
        </span>
      </div>
      <ul className="mt-5 divide-y">
        {rows.map((r) => (
          <li key={r.source} className="flex items-center justify-between py-3 text-[15px]">
            {r.source}
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                r.status === "In progress" ? "bg-muted text-muted-foreground" : "bg-signal/10 text-signal"
              }`}
            >
              {r.status}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

function FitList({ title, items, good }: { title: string; items: string[]; good?: boolean }) {
  const Icon = good ? Check : Minus
  return (
    <div className="rounded-3xl border bg-card p-7">
      <h3 className="text-lg font-medium">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-[15px]">
            <Icon className={`mt-0.5 size-4 shrink-0 ${good ? "text-signal" : "text-muted-foreground"}`} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
