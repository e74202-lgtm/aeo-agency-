import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

// Served at /robots.txt. An AEO agency should be readable by AI, so we explicitly
// welcome the major AI crawlers as well as regular search engines.
const aiCrawlers = [
  "GPTBot", // OpenAI training
  "OAI-SearchBot", // ChatGPT search
  "ChatGPT-User", // ChatGPT browsing on a user's behalf
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "Google-Extended", // Gemini
  "Applebot-Extended",
  "Bingbot", // Copilot
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: aiCrawlers, allow: "/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  }
}
