import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { FinalCta } from "@/components/home/final-cta"
import { SectionLabel } from "@/components/home/section-label"
import { StatCards } from "@/components/stat-cards"
import { OriginButton } from "@/components/ui/origin-button"
import { geoStudy, site, stats } from "@/lib/site"

const TITLE = "What is AEO? A plain-English guide to Answer Engine Optimization"
const DESCRIPTION =
  "Answer Engine Optimization (AEO) is how brands get named, cited and recommended by AI assistants like ChatGPT, Perplexity, Gemini and Google AI Overviews. What it is, how it works, and how to do it."
const PUBLISHED = "2026-10-12"

export const metadata: Metadata = {
  title: "What is AEO? Answer Engine Optimization explained",
  description: DESCRIPTION,
  openGraph: { type: "article", title: TITLE, description: DESCRIPTION },
}

const toc = [
  { id: "what-is-aeo", label: "What is AEO?" },
  { id: "how-ai-chooses", label: "How do AI engines decide what to recommend?" },
  { id: "aeo-vs-seo", label: "AEO vs SEO vs GEO" },
  { id: "why-now", label: "Why does AEO matter now?" },
  { id: "how-to", label: "How do you do AEO?" },
  { id: "measure", label: "How do you measure AEO?" },
  { id: "how-long", label: "How long does AEO take?" },
  { id: "mistakes", label: "Common AEO mistakes" },
  { id: "faq", label: "FAQ" },
]

const steps = [
  {
    title: "Pick the questions your buyers ask",
    body: "List the real questions people type into AI when they're choosing a product like yours: “best X for Y”, “alternatives to Z”, “X vs Y”. These are your prompts. Fifty to 150 is a good range for most businesses.",
  },
  {
    title: "Measure your starting point",
    body: "Ask those questions on the major AI engines and record whether you're named. This baseline, “named in X of Y prompts”, is the number you'll improve.",
  },
  {
    title: "Find the sources AI cites",
    body: "Look at which websites the engines cite in their answers. Roundups, review sites, comparison articles and community threads show up again and again. Those are your targets.",
  },
  {
    title: "Get mentioned in those sources",
    body: "Reach out to the people behind those pages, get listed on the review sites, and earn coverage with something worth writing about. Paid placements can be part of this, as long as they're clearly labeled as sponsored.",
  },
  {
    title: "Make your own site easy to cite",
    body: "AI often cites a brand's own pages. Clear FAQs, honest comparison pages, visible pricing, consistent facts about who you are, structured data, and letting AI crawlers in all help engines understand and quote you.",
  },
  {
    title: "Track weekly and keep it fresh",
    body: "AI answers change as new sources appear. Re-run the same questions every week, watch what moves, refresh older mentions, and adjust your question list as your market changes.",
  },
]

const mistakes = [
  {
    title: "Faking it",
    body: "Buying reviews, posting disguised promotional comments, or paying for mentions that aren't labeled. It breaks platform rules and advertising law, and gets brands publicly called out.",
  },
  {
    title: "Blocking AI crawlers",
    body: "If your robots.txt blocks AI crawlers, engines can't read your site, and can't cite it either.",
  },
  {
    title: "Inconsistent facts",
    body: "Different descriptions, prices or names across your site and listings make it harder for engines to trust what they find.",
  },
  {
    title: "Checking once",
    body: "One snapshot tells you little, because answers vary from run to run. The weekly trend is what matters.",
  },
  {
    title: "Chasing a single prompt",
    body: "Optimizing for one vanity question instead of the full set of questions real buyers ask.",
  },
  {
    title: "Expecting guarantees",
    body: "Nobody controls what AI engines say. Anyone promising guaranteed AI rankings is overselling.",
  },
]

const faqs = [
  {
    q: "Is AEO replacing SEO?",
    a: "No. Many AI engines search the web before answering, so strong SEO is still the foundation. AEO builds on it, focusing on being named and cited in the answer itself rather than only ranking in a list of links.",
  },
  {
    q: "Can anyone guarantee AI will recommend my brand?",
    a: "No. AI companies decide what their engines say and cite. A good AEO partner commits to the work, measures results honestly every week, and doesn't promise rankings.",
  },
  {
    q: "Do I need an llms.txt file?",
    a: "It's a helpful, low-effort extra: a plain-text summary of your business written for AI models. It won't make up for missing mentions on trusted sites, but it makes your own site easier for AI to understand.",
  },
  {
    q: "Can a small business do AEO?",
    a: "Yes. Small businesses often have an advantage in specific niches, where a handful of good mentions and a clear website can be enough to get named for the questions that matter.",
  },
]

const articleSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: TITLE,
      description: DESCRIPTION,
      datePublished: PUBLISHED,
      dateModified: PUBLISHED,
      mainEntityOfPage: `${site.url}/what-is-aeo`,
      author: { "@id": `${site.url}/#organization` },
      publisher: { "@id": `${site.url}/#organization` },
      image: `${site.url}/opengraph-image`,
      citation: [...stats.map((s) => s.href), geoStudy.href],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ],
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 pt-14 font-display text-3xl leading-[1.1] font-semibold tracking-[-0.035em] text-balance sm:text-4xl">
      {children}
    </h2>
  )
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 text-lg leading-relaxed text-foreground/80">{children}</p>
}

/** The one-sentence answer under each heading, styled so it stands out (and is easy for AI to quote). */
function Answer({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 border-l-2 border-signal pl-5 text-xl leading-relaxed font-medium">{children}</p>
}

export default function WhatIsAeoPage() {
  const published = new Date(`${PUBLISHED}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="mx-auto max-w-3xl px-5 pt-16 pb-24 md:pt-24">
        <header className="space-y-6">
          <SectionLabel>Guide</SectionLabel>
          <h1 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-5xl lg:text-6xl">
            What is AEO? <em className="text-signal">Answer Engine Optimization,</em> explained.
          </h1>
          <p className="text-sm text-muted-foreground">
            By {site.name} · Updated {published} · 6 min read
          </p>
        </header>

        <Answer>
          Answer Engine Optimization (AEO) is the practice of making your brand easy for AI assistants to find, trust and
          recommend, so that when someone asks ChatGPT, Perplexity, Gemini or Google&apos;s AI Overviews a question, your
          brand is part of the answer.
        </Answer>

        <nav aria-label="On this page" className="mt-10 rounded-2xl border bg-card p-6">
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">On this page</p>
          <ol className="mt-4 grid gap-2 text-[15px] sm:grid-cols-2">
            {toc.map((item, i) => (
              <li key={item.id}>
                <a href={`#${item.id}`} className="inline-flex gap-2 py-0.5 hover:text-signal">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <H2 id="what-is-aeo">What is AEO?</H2>
        <Answer>AEO is about being the brand AI names when people ask for a recommendation.</Answer>
        <P>
          Search used to mean typing a query and scanning ten blue links. More and more, people ask an AI assistant instead,
          and get back a single written answer with a short list of names. If a buyer asks &ldquo;what&apos;s the best
          bookkeeping firm for startups?&rdquo;, the brands in that answer make the shortlist. The rest are invisible.
        </P>
        <P>
          AEO is the work of getting onto that shortlist: understanding which questions your buyers ask, where AI engines
          get their information, and how to make sure those sources, and your own website, clearly point to you.
        </P>

        <H2 id="how-ai-chooses">How do AI engines decide what to recommend?</H2>
        <Answer>They lean on sources they trust. Brands that trusted sources talk about, often and clearly, get named.</Answer>
        <P>
          Most AI assistants combine two things: what the model learned during training, and a live web search they run
          when you ask a question. They then write an answer and often cite the pages they used.
        </P>
        <P>
          Those cited pages are usually industry roundups, review and comparison sites, news coverage, community threads,
          and brands&apos; own websites. When many credible sources mention a brand consistently for a topic, engines are
          more likely to name it. That&apos;s why AEO focuses on mentions and citations, not just keywords.
        </P>
        <P>
          How a page is written matters too. In one of the first studies of this, researchers found that adding{" "}
          <strong className="font-semibold text-foreground">statistics, quotations and source citations</strong> made
          pages noticeably more likely to be used in AI answers:
        </P>
        <StatCards items={[geoStudy]} className="mt-6 lg:grid-cols-1!" />

        <H2 id="aeo-vs-seo">How is AEO different from SEO and GEO?</H2>
        <Answer>SEO competes for a spot in a list of links. AEO competes to be in the answer itself.</Answer>
        <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[520px] text-left text-[15px]">
            <caption className="sr-only">AEO compared with SEO and GEO</caption>
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th scope="col" className="p-4 font-medium"><span className="sr-only">Aspect</span></th>
                <th scope="col" className="p-4 font-medium">SEO</th>
                <th scope="col" className="bg-signal/[0.07] p-4 font-medium text-signal">AEO</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["The goal", "Rank high in search results", "Be named and cited in AI answers"],
                ["Built around", "Keywords and pages", "Buyer questions and your brand as an entity"],
                ["Main signals", "Backlinks, relevance, page quality", "Mentions and citations across trusted sources"],
                ["The win", "A click to your site", "A recommendation, often before any click"],
                ["How it's measured", "Rankings and organic traffic", "Share of answer and citations"],
              ].map(([aspect, seo, aeo]) => (
                <tr key={aspect} className="border-b last:border-0">
                  <th scope="row" className="p-4 align-top text-sm font-normal text-muted-foreground">{aspect}</th>
                  <td className="p-4 align-top text-muted-foreground">{seo}</td>
                  <td className="bg-signal/[0.07] p-4 align-top font-medium">{aeo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <P>
          <strong className="font-semibold text-foreground">GEO</strong> (Generative Engine Optimization) is another name
          you&apos;ll see for roughly the same idea. Some people use GEO for AI-generated answers specifically and AEO more
          broadly, including voice assistants and featured snippets, but in practice the work overlaps almost entirely.
        </P>

        <H2 id="why-now">Why does AEO matter now?</H2>
        <Answer>Because buyers increasingly ask AI for a shortlist, and if you&apos;re not on it, you&apos;re not considered.</Answer>
        <P>
          AI answers compress the research step. Instead of opening ten tabs, a buyer reads one answer that names a few
          options. Being one of those names can matter more than ranking on page one, because many buyers never get to the
          links. And because engines repeat what trusted sources say, the brands that build those mentions early tend to
          keep showing up.
        </P>
        <P>The numbers behind the shift:</P>
        <StatCards items={stats} className="mt-6 lg:grid-cols-2!" />

        <H2 id="how-to">How do you do AEO?</H2>
        <Answer>Pick your buyers&apos; questions, measure, find what AI cites, get mentioned there, and track it weekly.</Answer>
        <ol className="mt-8 space-y-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-5 rounded-2xl border bg-card p-6">
              <span className="font-mono text-sm text-signal">{String(i + 1).padStart(2, "0")}</span>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <H2 id="measure">How do you measure AEO?</H2>
        <Answer>Track how often you&apos;re named across a fixed set of buyer questions, every week.</Answer>
        <P>The core metrics are simple:</P>
        <ul className="mt-5 space-y-3 text-lg leading-relaxed text-foreground/80">
          <li className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" /><span><strong className="font-semibold text-foreground">Share of answer:</strong> the percentage of your buyer questions where AI names you, for example &ldquo;named in 40 of 150 prompts&rdquo;.</span></li>
          <li className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" /><span><strong className="font-semibold text-foreground">Competitor share:</strong> how often rivals are named for the same questions.</span></li>
          <li className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" /><span><strong className="font-semibold text-foreground">Citations:</strong> how often engines cite your own website as a source.</span></li>
          <li className="flex gap-3"><span className="mt-3 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" /><span><strong className="font-semibold text-foreground">AI referral traffic:</strong> visits and leads arriving from AI assistants.</span></li>
        </ul>
        <P>Because answers vary from run to run, judge AEO by the trend over weeks, not any single answer.</P>

        <H2 id="how-long">How long does AEO take?</H2>
        <Answer>Expect changes to build over two to three months, with early movement often visible within weeks.</Answer>
        <P>
          Improvements to your own website can be picked up relatively quickly. New mentions on other sites take longer,
          because engines have to discover those pages and come to trust them. It varies by category and competition,
          which is why a weekly baseline matters: it shows what&apos;s working long before the full effect arrives.
        </P>

        <H2 id="mistakes">What are the most common AEO mistakes?</H2>
        <Answer>Faking mentions, blocking AI crawlers, and judging results from a single check.</Answer>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {mistakes.map((m) => (
            <div key={m.title} className="rounded-2xl border bg-card p-6">
              <h3 className="font-medium">{m.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{m.body}</p>
            </div>
          ))}
        </div>

        <H2 id="faq">AEO FAQ</H2>
        <dl className="mt-6 divide-y border-y">
          {faqs.map((f) => (
            <div key={f.q} className="py-6">
              <dt className="text-lg font-medium">{f.q}</dt>
              <dd className="mt-2 leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-14 flex flex-col gap-3 rounded-2xl bg-secondary p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Want to know where you stand?</p>
            <p className="text-sm text-muted-foreground">We&apos;ll check how AI answers for your brand, free.</p>
          </div>
          <div className="flex shrink-0 gap-2">
            <OriginButton href={site.cta.href} variant="primary" className="group h-11 px-5 text-sm">
              Free AI audit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </OriginButton>
            <OriginButton href="/how-it-works" className="h-11 px-5 text-sm">
              How we work
            </OriginButton>
          </div>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          Related: <Link href="/services" className="underline underline-offset-4 hover:text-signal">our AEO services</Link>{" "}
          · <Link href="/pricing" className="underline underline-offset-4 hover:text-signal">pricing</Link>
        </p>
      </article>

      <FinalCta />
    </>
  )
}
