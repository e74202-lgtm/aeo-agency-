import { ImageResponse } from "next/og"

import { brand, loadDisplayFont, LogoMark } from "@/lib/brand-image"
import { site } from "@/lib/site"

// The preview image shown when the site is shared (LinkedIn, iMessage, Slack, X...).
// Applies to every page unless a page adds its own.
export const alt = `${site.name}: Be the answer AI recommends.`
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const host = site.url.replace(/^https?:\/\//, "")
  const font = await loadDisplayFont(`Be the answer AI recommends. ${site.name} Answer Engine Optimization ${host}`)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: brand.paper,
          color: brand.ink,
          fontFamily: font ? "Inter Tight" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <LogoMark size={52} />
          <span style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.02em" }}>{site.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 76, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 1 }}>Be the answer AI</span>
          <span
            style={{ fontSize: 150, fontWeight: 800, letterSpacing: "-0.05em", lineHeight: 1.05, color: brand.emerald }}
          >
            recommends.
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: brand.muted }}>
          <span>Answer Engine Optimization</span>
          <span>{host}</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font ? [{ name: "Inter Tight", data: font, weight: 800, style: "normal" }] : undefined,
    },
  )
}
