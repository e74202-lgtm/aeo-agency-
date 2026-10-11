import type { MetadataRoute } from "next"

import { pages, site } from "@/lib/site"

// Served at /sitemap.xml: tells search and AI crawlers which pages exist.
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: `${site.url}${page.path === "/" ? "" : page.path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: page.path === "/" ? 1 : 0.7,
  }))
}
