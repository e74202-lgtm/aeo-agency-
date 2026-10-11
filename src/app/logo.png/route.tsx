import { ImageResponse } from "next/og"

import { brand, LogoMark } from "@/lib/brand-image"

// Served at /logo.png: a square logo referenced by the Organization schema (search engines prefer a PNG).
export const dynamic = "force-static"

export function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: brand.paper }}>
        <LogoMark size={380} />
      </div>
    ),
    { width: 512, height: 512 },
  )
}
