import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { FinalCta } from "@/components/home/final-cta"
import { SectionLabel } from "@/components/home/section-label"
import { Button } from "@/components/ui/button"
import { plans, site, type Plan } from "@/lib/site"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "AEO pricing: a free AI visibility audit, then Monitor ($500/mo), Growth ($1,500/mo) or Scale ($3,000/mo) to get your brand recommended by ChatGPT, Perplexity, Gemini and Google AI Overviews.",
}

const terms = [
  {
    q: "What's a placement?",
    a: "A mention of your brand in a source AI engines read and trust, like an industry roundup, review site, comparison article or community thread. Placements are what get you named in answers.",
  },
  {
    q: "What's a prompt run?",
    a: "We ask each major AI engine your list of buyer questions and record who gets named, cited and recommended. That's how we track your share of answer over time.",
  },
  {
    q: "Why refresh placements every 90 days?",
    a: "AI engines favor sources that look current. Refreshing older placements keeps them fresh, so they keep getting picked up.",
  },
  {
    q: "What's an original stat or data piece?",
    a: "A small piece of original research about your category. AI engines love citing unique numbers, so it becomes a magnet for mentions.",
  },
]

// Machine-readable pricing, so AI engines and Google can quote our plans accurately.
const offerSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Answer Engine Optimization",
  provider: { "@type": "Organization", name: site.name },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "AEO plans",
    itemListElement: plans.map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      description: plan.blurb,
      price: plan.price.replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
      ...(plan.period && {
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: plan.price.replace(/[^0-9.]/g, ""),
          priceCurrency: "USD",
          unitText: "MONTH",
        },
      }),
    })),
  },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: terms.map((t) => ({ "@type": "Question", name: t.q, acceptedAnswer: { "@type": "Answer", text: t.a } })),
}

export default function PricingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([offerSchema, faqSchema]) }} />

      <section className="mx-auto max-w-6xl px-5 pt-16 pb-24 md:pt-24">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <SectionLabel>Pricing</SectionLabel>
          <h1 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            Start free. Scale when <em className="text-signal">AI starts naming you.</em>
          </h1>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Every plan starts with a free audit, so you see exactly where you stand before you pay anything.
          </p>
        </div>

        <ul className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <li key={plan.name} className="flex">
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Prices in USD. Not sure which plan fits? Start with the free audit and we&apos;ll recommend one.
        </p>
      </section>

      <section className="border-t">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <div className="space-y-6">
            <SectionLabel>The fine print</SectionLabel>
            <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl">
              What the terms mean.
            </h2>
          </div>
          <dl className="divide-y border-y">
            {terms.map((t) => (
              <div key={t.q} className="space-y-2 py-6">
                <dt className="text-lg font-medium">{t.q}</dt>
                <dd className="leading-relaxed text-muted-foreground">{t.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <FinalCta />
    </>
  )
}

function PlanCard({ plan }: { plan: Plan }) {
  const featured = plan.featured
  return (
    <div
      className={`relative flex w-full flex-col rounded-3xl border p-7 ${
        featured ? "dark border-transparent shadow-2xl shadow-foreground/20" : "bg-card"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-7 rounded-full bg-signal px-3 py-1 font-mono text-[10px] font-medium tracking-[0.15em] text-background uppercase">
          Recommended
        </span>
      )}

      <h2 className="font-display text-xl font-semibold tracking-[-0.02em]">{plan.name}</h2>
      <p className="mt-2 min-h-12 text-sm leading-relaxed text-muted-foreground">{plan.blurb}</p>

      <p className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-5xl font-semibold tracking-[-0.04em] tabular-nums">{plan.price}</span>
        {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
      </p>

      <Button
        asChild
        variant={featured ? "default" : "outline"}
        className="group mt-6 h-11 w-full rounded-full text-sm"
      >
        <Link href={plan.cta.href}>
          {plan.cta.label}
          <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </Button>

      <ul className="mt-7 space-y-3 border-t pt-6 text-sm">
        {plan.includesFrom && (
          <li className="font-medium">Everything in {plan.includesFrom}, plus:</li>
        )}
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}
