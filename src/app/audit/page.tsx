import type { Metadata } from "next"
import { Check } from "lucide-react"

import { AuditForm } from "@/components/audit/audit-form"
import { InstantAudit } from "@/components/audit/instant-audit"
import { SectionLabel } from "@/components/home/section-label"

export const metadata: Metadata = {
  title: "Free AI Visibility Audit",
  description:
    "See in about a minute whether ChatGPT and Gemini recommend your brand, who they recommend instead, and how to fix it. Free, no obligation.",
}

const included = [
  {
    title: "Your score across 16 AI answers",
    body: "We ask ChatGPT and Gemini (with Google Search) 8 real buyer questions in your category and count how often you're named.",
  },
  {
    title: "Who gets recommended instead",
    body: "The competitors AI names in your place, and the sites it cites to pick them.",
  },
  {
    title: "Your top fixes",
    body: "Three practical next steps, based on the sources the engines actually trust.",
  },
]

const steps = [
  { title: "Tell us your brand", body: "Name, website and what you sell. About 30 seconds." },
  { title: "We ask the engines", body: "8 buyer questions, live, on ChatGPT and Gemini." },
  { title: "See your results", body: "On screen in about a minute. Nothing to wait for." },
]

export default function AuditPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-10 md:pt-24">
        <div className="mx-auto max-w-3xl space-y-6 text-center">
          <div className="flex justify-center">
            <SectionLabel>Free AI visibility snapshot</SectionLabel>
          </div>
          <h1 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            Find out what AI says <em className="text-signal">about you.</em> In about a minute.
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-muted-foreground">
            We ask ChatGPT and Gemini the questions your buyers ask, live, and show you whether you&apos;re in the answer.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-20">
        <div className="rounded-3xl border bg-background p-6 shadow-xl shadow-foreground/5 sm:p-10">
          <InstantAudit />
        </div>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-14 px-5 py-20 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-5">
            <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">What the snapshot shows</h2>
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
            <ol className="grid gap-px overflow-hidden rounded-2xl border bg-border">
              {steps.map((step, i) => (
                <li key={step.title} className="flex gap-4 bg-background p-5">
                  <span className="font-mono text-sm text-signal">0{i + 1}</span>
                  <div className="space-y-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="manual" className="scroll-mt-16 border-t">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-20">
          <div className="space-y-5">
            <SectionLabel>Prefer a full audit?</SectionLabel>
            <h2 className="font-display text-3xl leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-4xl">
              Want the hands-on version?
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
              We&apos;ll go deeper than the snapshot: more questions, more engines, checked by a person, with a short call
              to walk you through it.
            </p>
          </div>
          <div className="rounded-3xl border bg-background p-6 shadow-xl shadow-foreground/5 sm:p-8">
            <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">Request a full audit</h3>
            <p className="mt-2 mb-7 text-sm text-muted-foreground">
              Fields marked <span className="text-signal">*</span> are required.
            </p>
            <AuditForm />
          </div>
        </div>
      </section>
    </>
  )
}
