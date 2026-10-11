import type { Metadata } from "next"
import { ChevronRight, FileText, MessageSquare, Sparkles, Trophy } from "lucide-react"

import { FinalCta } from "@/components/home/final-cta"
import { SectionLabel } from "@/components/home/section-label"
import { OriginButton } from "@/components/ui/origin-button"

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How we get your brand recommended by AI: a free audit, a baseline across 150 buyer prompts, weekly tracking, and monthly placements in the sources AI engines trust.",
}

// How an AI engine arrives at a recommendation, simplified.
const flow = [
  { icon: MessageSquare, title: "A buyer asks", body: "“What's the best bookkeeping firm for startups?”" },
  { icon: Sparkles, title: "AI looks for sources", body: "It pulls from roundups, review sites, comparisons and threads it trusts." },
  { icon: FileText, title: "It weighs the mentions", body: "Brands that trusted sources talk about, often and clearly, stand out." },
  { icon: Trophy, title: "It names a few brands", body: "One answer, a handful of names. That's the shortlist." },
]

const steps = [
  {
    when: "Week 0",
    title: "Free AI visibility audit",
    body: "You request an audit. We ask the major AI engines the questions your buyers ask and show you where you're named, who's named instead, and the fixes that matter most.",
    plan: "Free",
  },
  {
    when: "Week 1",
    title: "Set your baseline",
    body: "Together we lock in your list of 150 buyer prompts and your key competitors, then run them all to get your starting number: named in X of 150.",
    plan: "Monitor+",
  },
  {
    when: "Every week",
    title: "Track the answers",
    body: "Your prompts run across every major engine weekly. You get the report, and an alert the moment a competitor starts showing up in your answers.",
    plan: "Monitor+",
  },
  {
    when: "Every month",
    title: "Build citations",
    body: "We find the sources engines cite for your prompts and reach out every month to get you mentioned in them. Scale gets twice the outreach. We also tell you which pages on your own site to add or improve so engines can cite you directly. Where it helps, we can add clearly labeled sponsored placements from a budget you approve. Engines decide what they cite, so we commit to the work and report the results.",
    plan: "Growth+",
  },
  {
    when: "Ongoing",
    title: "Refresh and tune",
    body: "Placements get refreshed every 90 days so they stay current, and your prompt list is tuned monthly as your market shifts.",
    plan: "Growth+",
  },
  {
    when: "Every two weeks",
    title: "Strategy call",
    body: "What moved, what's next, and where to focus. On Scale, we also publish an original stat or data piece to attract citations.",
    plan: "Scale",
  },
]

const milestones = [
  { when: "Week 1", title: "Your baseline", body: "A clear starting number, so every change after it is measurable." },
  { when: "Weeks 2 to 8", title: "The trend line", body: "Weekly reports show what's moving and which placements are getting picked up." },
  { when: "Months 2 to 3", title: "Consistent mentions", body: "Placements typically start showing up consistently in AI answers as engines discover and trust them." },
]

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How we get your brand recommended by AI engines",
  step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.body })),
}

export default function HowItWorksPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:pt-24">
        <div className="max-w-3xl space-y-6">
          <SectionLabel>How it works</SectionLabel>
          <h1 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            From invisible to <em className="text-signal">recommended</em>, one measurable step at a time.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            No black box. Here&apos;s exactly how AI engines choose who to recommend, what we do about it, and what
            you&apos;ll see along the way.
          </p>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <div className="max-w-2xl space-y-6">
            <SectionLabel>The mechanics</SectionLabel>
            <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
              How AI decides who to recommend.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              AI engines don&apos;t pick brands at random. They lean on the sources they trust. Get into those sources,
              and you get into the answer.
            </p>
          </div>

          <ol className="mt-12 grid gap-3 md:grid-cols-4">
            {flow.map((item, i) => (
              <li key={item.title} className="relative flex flex-col gap-4 rounded-3xl border bg-card p-6">
                <span className="flex size-10 items-center justify-center rounded-full bg-signal/10 text-signal">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div className="space-y-1.5">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
                {i < flow.length - 1 && (
                  <ChevronRight
                    className="absolute top-1/2 -right-3 z-10 hidden size-6 -translate-y-1/2 rounded-full border bg-background p-1 text-muted-foreground md:block"
                    aria-hidden="true"
                  />
                )}
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-muted-foreground">
            Our work targets steps two and three: making sure the sources AI reads mention you.
          </p>
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:py-24 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <SectionLabel>The process</SectionLabel>
            <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
              What we do, and when.
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Every client starts with the free audit. The tag on each step shows which plan includes it.
            </p>
            <OriginButton href="/pricing" className="h-11 px-5 text-sm">
              Compare plans
            </OriginButton>
          </div>

          <ol className="relative space-y-4 before:absolute before:top-6 before:bottom-6 before:left-[19px] before:w-px before:bg-border">
            {steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-5">
                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border bg-background font-mono text-sm text-signal">
                  {i + 1}
                </span>
                <div className="flex-1 space-y-2 rounded-2xl border bg-card p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{step.when}</span>
                    <span className="rounded-full border px-2.5 py-0.5 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase">
                      {step.plan}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="dark">
        <div className="mx-auto max-w-6xl px-5 py-20 md:py-24">
          <div className="max-w-2xl space-y-6">
            <SectionLabel>Setting expectations</SectionLabel>
            <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
              What you&apos;ll see, and when.
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              AEO compounds. Here&apos;s a realistic timeline, not a sales pitch.
            </p>
          </div>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {milestones.map((m) => (
              <li key={m.title} className="space-y-3 rounded-3xl border bg-card p-7">
                <p className="font-mono text-sm text-signal">{m.when}</p>
                <h3 className="text-xl font-medium">{m.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{m.body}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
            Nobody controls what AI engines say, so we don&apos;t promise rankings. We promise the work, and an honest
            weekly number on whether it&apos;s paying off.
          </p>
        </div>
      </section>

      <div className="pt-24 md:pt-32">
        <FinalCta />
      </div>
    </>
  )
}
