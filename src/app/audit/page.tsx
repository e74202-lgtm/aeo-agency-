import type { Metadata } from "next"
import { Check } from "lucide-react"

import { AuditForm } from "@/components/audit/audit-form"
import { SectionLabel } from "@/components/home/section-label"

export const metadata: Metadata = {
  title: "Free AI Visibility Audit",
  description:
    "Find out whether ChatGPT, Perplexity, Gemini and Google AI Overviews recommend your brand, who they recommend instead, and how to fix it. Free, no obligation.",
}

const included = [
  {
    title: "Your brand, tested across AI engines",
    body: "We ask ChatGPT, Perplexity, Gemini and Google AI Overviews the questions your buyers ask, and record whether you come up.",
  },
  {
    title: "Who gets recommended instead",
    body: "The competitors AI names in your place, and the sources it's pulling from to pick them.",
  },
  {
    title: "Your top fixes, ranked by impact",
    body: "A short, plain-English list of what to change first. Yours to keep, whether or not you work with us.",
  },
]

const steps = [
  { title: "Request", body: "Fill in the form. Takes two minutes." },
  { title: "We test", body: "We run your buyer questions across every major engine." },
  { title: "You get the results", body: "Delivered to your inbox, with a short call if you want one." },
]

export default function AuditPage() {
  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-5 py-16 md:py-24 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-20">
      <div className="space-y-12">
        <div className="space-y-6">
          <SectionLabel>Free AI visibility audit</SectionLabel>
          <h1 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            Find out what AI says <em className="text-signal">about you.</em>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            When your buyers ask AI for a recommendation, are you in the answer? We&apos;ll check, show you who is,
            and tell you how to change it.
          </p>
        </div>

        <div className="space-y-5">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">What you get</h2>
          <ul className="space-y-5">
            {included.map((item) => (
              <li key={item.title} className="flex gap-4">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-signal/10 text-signal">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">How it works</h2>
          <ol className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="space-y-2 bg-background p-5">
                <span className="font-mono text-sm text-signal">0{i + 1}</span>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border bg-background p-6 shadow-xl shadow-foreground/5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">Request your audit</h2>
          <p className="mt-2 mb-7 text-sm text-muted-foreground">
            Fields marked <span className="text-signal">*</span> are required.
          </p>
          <AuditForm />
        </div>
      </div>
    </section>
  )
}
