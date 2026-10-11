// One place for site-wide info and homepage copy. Change the name here once we pick one.
export const site = {
  name: "[Agency]",
  tagline: "Be the answer.",
  description:
    "We get your brand cited and recommended by ChatGPT, Perplexity, Gemini and Google AI Overviews.",
  nav: [
    { label: "Services", href: "/services" },
    { label: "How it works", href: "/how-it-works" },
    { label: "Pricing", href: "/pricing" },
  ],
  cta: { label: "Free AI audit", href: "/audit" },
}

export const engines = [
  "ChatGPT",
  "Perplexity",
  "Google AI Overviews",
  "Gemini",
  "Claude",
  "Copilot",
]

export const steps = [
  {
    title: "Audit the answers",
    body: "We run the real questions your buyers ask across every major AI engine and record who gets named, cited and recommended.",
  },
  {
    title: "Fix what AI can't read",
    body: "Schema, entity data and site structure, cleaned up so models understand exactly who you are and what you're best at.",
  },
  {
    title: "Publish answer-ready content",
    body: "Pages built to be quoted: direct answers, original data and comparisons that engines lift straight into their responses.",
  },
  {
    title: "Earn the citations",
    body: "AI trusts what others say about you. We get you into the reviews, roundups and forums that models pull their sources from.",
  },
]

export const faqs = [
  {
    q: "What is AEO?",
    a: "Answer Engine Optimization is the work of getting your brand named, cited and recommended inside AI-generated answers, the responses people get from ChatGPT, Perplexity, Gemini and Google's AI Overviews.",
  },
  {
    q: "How is AEO different from SEO?",
    a: "SEO competes for a spot in a list of links. AEO competes to be the answer itself. It leans more on clear entity data, quotable content and third-party mentions than on keywords and backlinks alone.",
  },
  {
    q: "Do I still need SEO?",
    a: "Yes. Many AI engines pull from search results, so solid SEO is the foundation. AEO builds on top of it to make sure that when an engine summarizes your category, you're in the summary.",
  },
  {
    q: "How long until we see results?",
    a: "Technical fixes can show up in some engines within weeks. Citation-driven gains usually build over two to three months as new mentions get picked up.",
  },
  {
    q: "How do you measure success?",
    a: "Share of answer: how often you're named for a fixed set of buyer prompts across engines, tracked monthly against your top competitors. Plus the traffic and leads AI engines send you.",
  },
  {
    q: "What's in the free audit?",
    a: "We test a set of buyer prompts for your category, show where you appear and where competitors appear instead, and give you the top fixes ranked by impact. No obligation.",
  },
]

export type Plan = {
  name: string
  price: string
  period?: string
  blurb: string
  includesFrom?: string
  features: string[]
  cta: { label: string; href: string }
  featured?: boolean
}

export const plans: Plan[] = [
  {
    name: "Free AI Audit",
    price: "$0",
    blurb: "See where you stand before you spend a dollar.",
    features: [
      "Your brand tested across the major AI engines",
      "Who gets recommended instead of you",
      "Your top fixes, ranked by impact",
    ],
    cta: { label: "Get my free audit", href: "/audit" },
  },
  {
    name: "Monitor",
    price: "$500",
    period: "/month",
    blurb: "Know every week whether AI is naming you.",
    features: [
      "Weekly prompt runs across every major engine",
      "“Named in X of 150 prompts” report",
      "Alert when a competitor moves in",
    ],
    cta: { label: "Start with a free audit", href: "/audit" },
  },
  {
    name: "Growth",
    price: "$1,500",
    period: "/month",
    blurb: "Actively earn the mentions that get you recommended.",
    includesFrom: "Monitor",
    features: [
      "4 placements a month",
      "90-day refresh on older placements",
      "Prompt list tuned every month",
    ],
    cta: { label: "Start with a free audit", href: "/audit" },
    featured: true,
  },
  {
    name: "Scale",
    price: "$3,000",
    period: "/month",
    blurb: "Become the default answer in your category.",
    includesFrom: "Growth",
    features: [
      "10 placements a month",
      "One original stat or data piece",
      "Fortnightly strategy call",
    ],
    cta: { label: "Start with a free audit", href: "/audit" },
  },
]
