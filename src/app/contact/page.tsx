import type { Metadata } from "next"
import Link from "next/link"
import { Check } from "lucide-react"

import { ContactForm } from "@/components/contact/contact-form"
import { SectionLabel } from "@/components/home/section-label"
import { planOptions } from "@/lib/site"

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to us about the Monitor, Growth or Scale plan, and getting your brand recommended by AI.",
}

const next = [
  "We look at your site and how AI currently answers for your category",
  "We reply by email with a recommended plan and next steps",
  "If it's a fit, we set up your prompt list and start tracking",
]

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan } = await searchParams
  // Pre-select the plan from the pricing page button, e.g. /contact?plan=growth
  const defaultPlan = planOptions.some((p) => p.value === plan) ? plan! : "not-sure"

  return (
    <section className="mx-auto grid max-w-6xl gap-14 px-5 py-16 md:py-24 lg:grid-cols-[1fr_minmax(0,30rem)] lg:gap-20">
      <div className="space-y-10">
        <div className="space-y-6">
          <SectionLabel>Contact</SectionLabel>
          <h1 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            Let&apos;s get you <em className="text-signal">recommended.</em>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
            Interested in Monitor, Growth or Scale? Tell us a bit about your business and we&apos;ll get back to you.
          </p>
        </div>

        <div className="space-y-5">
          <h2 className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">What happens next</h2>
          <ol className="space-y-4">
            {next.map((item, i) => (
              <li key={item} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs text-signal">
                  {i + 1}
                </span>
                <span className="pt-0.5 leading-relaxed text-muted-foreground">{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
          <span>
            Not ready to talk yet?{" "}
            <Link href="/audit" className="font-medium text-foreground underline underline-offset-4 hover:text-signal">
              Start with the free audit
            </Link>
            .
          </span>
        </p>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border bg-background p-6 shadow-xl shadow-foreground/5 sm:p-8">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">Send us a message</h2>
          <p className="mt-2 mb-7 text-sm text-muted-foreground">
            Fields marked <span className="text-signal">*</span> are required.
          </p>
          <ContactForm defaultPlan={defaultPlan} />
        </div>
      </div>
    </section>
  )
}
