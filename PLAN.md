# AEO Agency Website: Plan

Status: building. Name: **Samael**. Domain not bought yet (samael.agency or samaelagency.com appear free).

## Decisions made
- **Positioning:** by outcome, not by industry.
- **Build:** coded by Claude (not no-code).
- **Components:** the owner will supply components and designs (e.g. from 21st.dev) to drop in.
- **Name:** Samael. **Domain:** not decided yet.

---

## 1. Positioning

AEO (Answer Engine Optimization) means getting a brand cited and recommended inside AI answers: ChatGPT, Perplexity, Google AI Overviews, Gemini and Claude.

**Outcome we sell:** when buyers ask AI "who's the best [category]?", the answer is our client.

**Headline options:**
- "When your customers ask AI who to buy from, the answer should be you."
- "Get recommended by ChatGPT, not just ranked by Google."
- "Be the answer."

**Entry offer:** a free AI Visibility Audit. We test real buyer prompts across AI engines and show where the brand appears, where competitors appear instead, and why.

**The site is case study #1.** Prospects will check whether we show up in AI answers ourselves.

---

## 2. Sitemap (MVP: about 8 pages)

```
/                     Home
/services             Services overview
  /services/audit       AI Visibility Audit (entry offer)
  /services/retainer    AEO Retainer (ongoing)
/how-it-works         Our method
/results              Case studies
/pricing              Pricing
/resources            Blog + guides
  /resources/what-is-aeo  Pillar guide
/about                About
/faq                  FAQ
/audit                Book a call / free audit form
```

---

## 3. Page by page

| Page | Goal | Key sections |
|---|---|---|
| Home | Get visitors to request an audit | Hero (outcome headline + "Get your free AI visibility score"), screenshot of an AI answer citing a brand, SEO vs AEO comparison, 3-step process, proof, FAQ, CTA |
| Services | Explain what they're buying | Each service: problem → deliverables → timeline → outcome |
| How It Works | Build trust in the method | 1. Audit prompts across AI engines → 2. Fix entity and schema gaps → 3. Publish answer-ready content → 4. Earn third-party mentions → 5. Track share-of-answer monthly |
| Results | Show proof | Before/after citation screenshots, share-of-voice charts. Our own site first |
| Pricing | Qualify leads | Audit (one-time), Growth retainer, Enterprise ("contact us") |
| Resources | Get ranked and cited | Pillar guide, glossary, "How to show up in ChatGPT" posts, original data studies |
| FAQ | Win the AI answer itself | 10–15 real questions, each answered directly in 2–3 sentences |
| Audit | Convert | Short form (name, email, website, top competitor) + calendar embed |

---

## 4. The site must practice AEO itself

- Schema (JSON-LD): `Organization`, `ProfessionalService`, `Service`, `FAQPage`, `Article`, `Person`
- `/llms.txt` summarizing who we are and the key pages
- Answer-first writing: H2s are questions, the first sentence answers them
- Don't block AI crawlers (GPTBot, PerplexityBot, ClaudeBot, Google-Extended) in `robots.txt`
- `sitemap.xml`, clean URLs, server-rendered content (nothing important hidden behind client JS)
- Consistent entity info across LinkedIn, Crunchbase, Google Business Profile, directories
- Original data posts (e.g. "We tested 500 prompts. Here's who AI recommends.")
- Author page for the founder with real credentials

---

## 5. Conversion

- Primary CTA: "Get your free AI Visibility Audit"
- Secondary CTA: "Book a 20-min call"
- Lead magnet: AEO checklist (email capture)
- Later: interactive "AI visibility score" tool

---

## 6. Tech stack

Chosen so 21st.dev components drop in directly (they're React + Tailwind + shadcn/ui).

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Animation:** Framer Motion (only if a supplied component needs it)
- **Blog:** MDX files in the repo to start
- **Forms / booking:** Tally or Formspree + Cal.com embed (decide at build time)
- **Hosting:** Vercel (free tier)
- **Analytics:** Plausible or PostHog, Google Search Console, Bing Webmaster Tools
- **AI referral tracking:** tag visits from chatgpt.com, perplexity.ai, gemini.google.com, etc.

### How to hand over 21st.dev components
1. Copy the component's install command (`npx shadcn@latest add "https://21st.dev/r/..."`) or paste its code.
2. Say which page and section it's for (e.g. "Home hero").
3. Claude installs it, adapts the copy and colors to our brand, and checks it on mobile.

---

## 7. Build order

1. Scaffold Next.js + Tailwind + shadcn, basic layout (nav, footer), deploy to Vercel
2. Home page (with supplied hero/sections)
3. Audit page (form + booking)
4. Services + Pricing
5. FAQ + How It Works (with FAQ schema)
6. About + Results
7. Resources/blog + "What is AEO?" pillar guide
8. SEO/AEO layer: schema, `llms.txt`, `robots.txt`, sitemap, Open Graph images
9. Analytics + launch

---

## 8. Launch timeline

| Week | Work |
|---|---|
| 1 | Pick name + domain, write homepage copy, scaffold site |
| 2 | Home, Audit, Services, Pricing |
| 3 | FAQ, How It Works, About, pillar guide, schema + `llms.txt` |
| 4 | Launch; run free audits for 5–10 businesses → turn into case studies |
| Ongoing | 1–2 resource posts per week; track whether we appear in AI answers |

---

## 9. Metrics

- Audit requests per week (main metric)
- Call → client close rate
- Whether ChatGPT, Perplexity and Gemini mention us for "best AEO agency"
- Traffic from AI engines

---

## Open questions
- [x] Agency name: Samael
- [ ] Domain
- [ ] Brand colors / vibe (can come from the first 21st.dev components supplied)
- [ ] Pricing numbers
- [ ] Form + booking tools
