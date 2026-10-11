import { Engines } from "@/components/home/engines"
import { Faq } from "@/components/home/faq"
import { FinalCta } from "@/components/home/final-cta"
import { Hero } from "@/components/home/hero"
import { Measure } from "@/components/home/measure"
import { Method } from "@/components/home/method"
import { Shift } from "@/components/home/shift"
import { faqs } from "@/lib/site"

// FAQ schema helps AI engines and Google lift our answers directly. We practice what we sell.
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <Engines />
      <Shift />
      <Method />
      <Measure />
      <Faq />
      <FinalCta />
    </>
  )
}
