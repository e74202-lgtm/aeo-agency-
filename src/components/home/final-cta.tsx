import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { site } from "@/lib/site"

const included = [
  "Your brand tested across the major AI engines",
  "Who gets recommended instead of you, and why",
  "Your top fixes, ranked by impact",
]

export function FinalCta() {
  return (
    <section className="px-5 pb-24 md:pb-32">
      <div className="reveal relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-signal px-7 py-16 text-signal-foreground sm:px-12 md:py-24">
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -right-16 -bottom-24 size-[420px] text-white/10"
          aria-hidden="true"
        >
          <path
            d="M100 10C50 10 10 46 10 91c0 25 12 47 32 62l-7 38 40-21c8 2 16 3 25 3 50 0 90-36 90-82S150 10 100 10Z"
            fill="currentColor"
          />
        </svg>

        <div className="relative grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <div className="space-y-6">
            <p className="font-mono text-[11px] tracking-[0.18em] uppercase">Free AI visibility audit</p>
            <h2 className="font-display text-4xl leading-[0.98] font-semibold tracking-[-0.045em] sm:text-5xl text-balance md:text-7xl">
              Find out what AI says about you.
            </h2>
            <Button
              asChild
              className="group mt-4 h-12 rounded-full bg-foreground px-6 text-[15px] text-background hover:bg-foreground/85"
            >
              <Link href={site.cta.href}>
                Get my free audit
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>

          <ul className="space-y-4 text-[15px] font-medium">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-foreground text-signal-bright">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
