import type { Metadata } from "next"
import { Activity, Rocket, Search, TrendingUp } from "lucide-react"

import { FinalCta } from "@/components/home/final-cta"
import { SectionLabel } from "@/components/home/section-label"
import { PricingModule, type PricingPlan } from "@/components/ui/pricing-module"
import { plans, site } from "@/lib/site"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "AEO pricing: a free AI visibility audit, then Monitor ($500/mo), Growth ($1,500/mo) or Scale ($3,000/mo) to get your brand recommended by ChatGPT, Perplexity, Gemini and Google AI Overviews.",
}

const terms = [
  {
    q: "What's citation building?",
    a: "We reach out to the sources AI engines cite most in your category, like industry roundups, review sites, comparison articles and community threads, to get your brand mentioned there. Each mention is a placement, and placements are what engines pick up and cite. Placements can be earned through outreach or, with your approval, sponsored.",
  },
  {
    q: "What's a prompt run?",
    a: "We ask each major AI engine your list of buyer questions and record who gets named, cited and recommended. That's how we track your share of answer over time.",
  },
  {
    q: "What are sponsored placements?",
    a: "Some high-value sources sell featured listings or sponsored articles. On Growth and Scale we can buy these for you from a separate placement budget that you approve in advance, one placement at a time. Sponsored placements are always clearly labeled as sponsored, and we never pay for reviews or disguised comments.",
  },
  {
    q: "What are own-site recommendations?",
    a: "AI engines often cite a brand's own website, so we tell you which pages to add or improve, like clear FAQs, comparison pages and pricing details, based on what your prompt runs show. You or your web team make the changes; we check whether engines start citing them.",
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

// The same six rows on every card, so it's easy to see what each upgrade adds.
// Index = plan order in site.ts: Free AI Audit, Monitor, Growth, Scale.
const comparison: { label: string | string[]; from: number }[] = [
  { label: "AI visibility audit", from: 0 },
  { label: "Weekly prompt runs + \u201cNamed in X of 150\u201d report", from: 1 },
  { label: "Competitor alerts", from: 1 },
  {
    label: ["Citation building", "Citation building", "Citation building + tracking", "Citation building (2\u00d7 outreach) + tracking"],
    from: 2,
  },
  { label: "Optional sponsored placements (you approve each)", from: 2 },
  { label: "Own-site recommendations (pages to add or fix)", from: 2 },
  { label: "90-day refresh + monthly prompt tuning", from: 2 },
  { label: "Original data piece + fortnightly strategy calls", from: 3 },
]

const icons = [Search, Activity, TrendingUp, Rocket]

const modulePlans: PricingPlan[] = plans.map((plan, i) => {
  const Icon = icons[i]
  const isFree = !plan.period
  return {
    id: plan.name.toLowerCase().replace(/\s+/g, "-"),
    name: plan.name,
    description: plan.blurb,
    icon: (
      <span className="flex size-12 items-center justify-center rounded-2xl bg-signal/10 text-signal">
        <Icon className="size-6" aria-hidden="true" />
      </span>
    ),
    priceMonthly: Number(plan.price.replace(/[^0-9.]/g, "")),
    ...(isFree && { priceLabel: "Free", periodLabel: "one-time" }),
    features: comparison.map((row) => ({
      label: Array.isArray(row.label) ? row.label[i] : row.label,
      included: i >= row.from,
    })),
    recommended: plan.featured,
    cta: plan.cta,
  }
})

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

        <PricingModule plans={modulePlans} className="mt-10 bg-transparent px-0 py-0 md:px-0" />

        <p className="mt-8 text-center text-sm text-muted-foreground">
          AI engines decide what they cite, so we commit to the work and show you the results every week.
          <br />
          Sponsored placements are optional, paid from a separate budget you approve, and always labeled.
          <br />
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
