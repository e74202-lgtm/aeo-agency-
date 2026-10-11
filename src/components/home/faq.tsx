import { Plus } from "lucide-react"

import { SectionLabel } from "@/components/home/section-label"
import { faqs } from "@/lib/site"

export function Faq() {
  return (
    <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 md:py-32 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <SectionLabel>FAQ</SectionLabel>
        <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
          Straight answers.
        </h2>
        <p className="max-w-sm text-muted-foreground">Fitting, for an answer engine agency.</p>
      </div>

      <div className="border-t">
        {faqs.map((item) => (
          <details key={item.q} className="group border-b">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium transition-colors hover:text-signal [&::-webkit-details-marker]:hidden">
              <h3>{item.q}</h3>
              <Plus
                className="size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-open:rotate-45"
                aria-hidden="true"
              />
            </summary>
            <p className="max-w-2xl pb-6 leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
