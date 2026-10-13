# Weekly AI visibility tracker + Radar

Runs each client's buyer questions on **ChatGPT, Gemini and Perplexity**, tracks how often the client is named and which pages each engine cites, drafts prompt lists, and builds an internal dashboard (Radar) across all clients.

Client files, results and reports are **ignored by git**: client data never reaches GitHub.

## Add a client

```bash
mkdir -p tracker/clients
cp tracker/clients.example/northwind-books.json tracker/clients/acme.json
```

Edit `tracker/clients/acme.json`:

| Field | What to put |
|---|---|
| `name` | The brand, as AI would write it |
| `website` | Their domain, e.g. `acme.com` |
| `aliases` | Other spellings people use (optional) |
| `competitors` | Brands to track against, each with optional `aliases` |
| `category` | What they sell, in buyer words, e.g. `bookkeeping firm` (for the prompt generator) |
| `audience` | Who they sell to, e.g. `["startups", "SaaS companies"]` (optional) |
| `products` | Key products or services (optional) |
| `prompts` | The buyer questions (150 on Monitor). Use the prompt generator below, then tune monthly on Growth. |

## Run it

```bash
npm run track                 # every client
npm run track -- acme         # one client
npm run track -- --limit 5    # first 5 prompts only, for a cheap test
npm run track -- --open       # open the report when done
```

## Draft prompts for a client

```bash
npm run prompts -- acme              # ~150 prompts into tracker/clients/acme.prompts-draft.txt
npm run prompts -- acme --count 30   # fewer, e.g. for a free audit
npm run prompts -- acme --apply      # after editing the draft, copy it into acme.json
```

Grouped by buyer intent (best-of, audience, alternatives, comparisons, pricing, choosing). Without `OPENAI_API_KEY` it uses templates (free, usually fewer than 150); with it, an AI writes a more varied list. The client's own brand never appears in the questions. `--apply` backs up the old list first.

## Radar: your internal dashboard

```bash
npm run radar -- --open
```

Builds `tracker/reports/_radar/radar-<date>.html` from saved results (no API calls, free):
- **Exposure by engine:** every client's "named in" % on ChatGPT, Gemini and Perplexity, with change vs the previous run
- **Opportunities:** pages AI cites often where the client is rarely named alongside: your outreach targets
- **Cited pages by engine:** the top pages each engine cites, how often, and how often the client was named alongside

Run `npm run track` first; Radar reads its results.

## Sample report for prospects

```bash
npm run track -- --sample --open
```

Creates a sample report from a **fictional** client (150 prompts, 8 weeks of trend) with a green "Sample report: illustrative data" banner. Free (no API calls), and never mixed into real client history. Saved in `tracker/reports/_sample/`. Show it on sales calls so prospects see exactly what they'd get.

## Track Samael itself

`tracker/clients/samael.json` tracks your own agency on 25 starter prompts. Once API keys are in, run it weekly:

```bash
npm run track -- samael --open
```

Add competitors you meet in sales to its `competitors` list, and update `website` when you connect your own domain. Your rising score becomes proof for future clients.

Each run saves:
- `tracker/results/<client>/<date>.json`: every answer (used for next week's comparison)
- `tracker/reports/<client>/<date>.html`: the client report. Open it in a browser, **File → Print → Save as PDF**, then email it.

Run once a week, ideally on the same day.

## API keys

Put these in `.env.local` (never committed):

```
OPENAI_API_KEY=...
GEMINI_API_KEY=...
PERPLEXITY_API_KEY=...
```

Without them, the tracker uses **demo data** and the report says so in a yellow banner. Never send a demo report to a client.

Cost: a 150-prompt client is 450 answers a week (150 × 3 engines). Web-search calls carry a per-call fee on top of normal usage, so check current API pricing and set spending limits in both accounts before adding clients.
