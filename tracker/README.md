# Weekly AI visibility tracker

Runs each client's buyer questions on ChatGPT and Gemini, tracks how often the client is named, and creates a report you can send.

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
| `prompts` | The buyer questions (150 on Monitor). Tune them monthly on Growth. |

## Run it

```bash
npm run track                 # every client
npm run track -- acme         # one client
npm run track -- --limit 5    # first 5 prompts only, for a cheap test
npm run track -- --open       # open the report when done
```

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
```

Without them, the tracker uses **demo data** and the report says so in a yellow banner. Never send a demo report to a client.

Cost: a 150-prompt client is 300 answers a week (150 × 2 engines). Web-search calls carry a per-call fee on top of normal usage, so check current API pricing and set spending limits in both accounts before adding clients.
