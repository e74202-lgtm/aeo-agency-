"use client"

import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"

import { AnswerCard } from "@/components/home/answer-card"
import { OriginButton } from "@/components/ui/origin-button"
import GlyphPortal, { type GlyphPortalStyle } from "@/components/ui/glyph-portal"
import { site } from "@/lib/site"

// The portal measures the letters once, so it needs the real font loaded first.
const FONT = '"Inter Tight", Arial, sans-serif'

const portalColors: GlyphPortalStyle = {
  "--gp-paper": "var(--background)",
  "--gp-ink": "var(--foreground)",
  "--gp-field": "oklch(0.3 0.07 164)",
  "--gp-foreground": "oklch(0.97 0.004 85)",
}

export function Hero() {
  const [fontReady, setFontReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    document.fonts
      .load(`800 100px "Inter Tight"`)
      .catch(() => {})
      .then(() => {
        if (!cancelled) setFontReady(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <GlyphPortal
      // Remount once the font is in, so the letters are measured with the real face.
      key={fontReady ? "font-ready" : "font-pending"}
      word="recommends."
      focusChar="m"
      interactive={false}
      fontFamily={FONT}
      fontWeight={800}
      scrollLength={2.2}
      enterLabel="Scroll to see it in action"
      className="hero-portal"
      style={portalColors}
      // No background prop: the letters show the portal's built-in emerald gradient.
      front={
        <>
          <div data-hero-top className="flex flex-col items-center gap-6 text-center">
            <p className="inline-flex items-center gap-2 rounded-full border bg-card/70 px-3.5 py-1.5 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
              <span className="size-1.5 rounded-full bg-signal" aria-hidden="true" />
              Answer Engine Optimization
            </p>
            <h1 className="font-display text-[clamp(2.25rem,6vw,4.75rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
              Be the answer AI <span className="sr-only">recommends.</span>
            </h1>
          </div>

          <div data-hero-bottom className="flex flex-col items-center text-center">
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
              When buyers ask ChatGPT, Perplexity or Google who to trust, they get one answer, not ten links.
              We make sure that answer is you.
            </p>
            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <OriginButton href={site.cta.href} variant="primary" className="group px-6">
                Get your free AI visibility audit
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </OriginButton>
              <OriginButton href="#method" className="px-6">
                See how it works
              </OriginButton>
            </div>
          </div>
        </>
      }
    >
      {/* Revealed once the camera is inside the letter */}
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <div className="space-y-4">
          <p className="font-mono text-[11px] tracking-[0.18em] text-white/70 uppercase">What being the answer looks like</p>
          <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-5xl">
            Your buyer asks. AI names you.
          </h2>
        </div>
        <div className="w-full">
          <AnswerCard />
          <p className="mt-4 font-mono text-[11px] tracking-[0.18em] text-white/60 uppercase">
            Example answer. Fictional brand.
          </p>
        </div>
      </div>
    </GlyphPortal>
  )
}
