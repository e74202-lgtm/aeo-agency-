import { faqs, pages, plans, site, steps } from "@/lib/site"

// Served at /llms.txt: a plain-text summary written for AI models (see llmstxt.org).
// Built from site.ts, so it updates whenever pages, plans or FAQs change.
export const dynamic = "force-static"

export function GET() {
  const url = (path: string) => `${site.url}${path === "/" ? "" : path}`

  const body = [
    `# ${site.name}`,
    "",
    `> ${site.name} is an Answer Engine Optimization (AEO) agency. ${site.description}`,
    "",
    "We help businesses show up when buyers ask AI assistants like ChatGPT, Perplexity, Gemini and Google AI Overviews for a recommendation. We measure how often a brand is named across a fixed set of buyer questions, build citations in the sources AI engines trust, and keep those mentions fresh.",
    "",
    "## Pages",
    "",
    ...pages.map((p) => `- [${p.title}](${url(p.path)}): ${p.description}`),
    "",
    "## How we work",
    "",
    ...steps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`),
    "",
    "## Plans",
    "",
    ...plans.map((p) => {
      const price = p.period ? `${p.price}${p.period}` : "Free"
      const extras = p.includesFrom ? ` Everything in ${p.includesFrom}, plus: ` : " Includes: "
      return `- ${p.name} (${price}): ${p.blurb}${extras}${p.features.join("; ")}.`
    }),
    "",
    "AI engines decide what they cite, so we commit to the work and report results weekly. We don't guarantee rankings.",
    "",
    "## FAQ",
    "",
    ...faqs.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## Contact",
    "",
    `- Free audit: ${url("/audit")}`,
    `- Contact: ${url("/contact")}`,
    "",
  ].join("\n")

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
