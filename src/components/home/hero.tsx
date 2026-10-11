import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { AnswerCard } from "@/components/home/answer-card"
import { Button } from "@/components/ui/button"
import MovingGrid from "@/components/ui/hyper-grid"
import { site } from "@/lib/site"

export function Hero() {
  return (
    <section>
      {/* HyperGrid: dark, cursor-reactive 3D grid. Fills the screen below the header. */}
      <MovingGrid className="h-auto! min-h-[calc(100dvh-4rem)] pt-20 pb-44 md:pb-60" maskRadius={380}>
        {/* "dark" flips our color tokens so text and buttons read on the black grid */}
        <div className="dark flex flex-col items-center bg-transparent!">
          <p className="animate-rise inline-flex items-center gap-2 rounded-full border bg-white/5 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase backdrop-blur-md">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-signal opacity-60 motion-reduce:hidden" />
              <span className="relative size-1.5 rounded-full bg-signal" />
            </span>
            Answer Engine Optimization
          </p>

          <h1
            className="animate-rise mt-8 max-w-5xl font-display text-[clamp(2.75rem,8vw,6.25rem)] leading-[0.95] font-semibold tracking-[-0.045em] text-balance"
            style={{ "--delay": "100ms" } as React.CSSProperties}
          >
            Be the answer AI <em className="text-signal">recommends.</em>
          </h1>

          <p
            className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl"
            style={{ "--delay": "200ms" } as React.CSSProperties}
          >
            When buyers ask ChatGPT, Perplexity or Google who to trust, they get one answer, not ten links.
            We make sure that answer is you.
          </p>

          <div
            className="animate-rise mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            style={{ "--delay": "300ms" } as React.CSSProperties}
          >
            <Button asChild className="group h-12 rounded-full px-6 text-[15px]">
              <Link href={site.cta.href}>
                Get your free AI visibility audit
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full px-6 text-[15px] backdrop-blur-md">
              <Link href="#method">See how it works</Link>
            </Button>
          </div>

          <p
            className="animate-rise mt-5 text-sm text-muted-foreground"
            style={{ "--delay": "400ms" } as React.CSSProperties}
          >
            Free. No obligation. Takes two minutes to request.
          </p>
        </div>
      </MovingGrid>

      {/* The example answer overlaps the bottom of the grid, so it peeks in on first load */}
      <div className="relative z-10 mx-auto -mt-32 max-w-3xl px-5 pb-24 text-center md:-mt-44 md:pb-32">
        <AnswerCard />
        <p className="mt-4 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Example answer. Fictional brand.
        </p>
      </div>
    </section>
  )
}
