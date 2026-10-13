// Samael Radar: an internal dashboard across all clients, built from saved tracker results.
// No API calls, so it's free to run as often as you like.
//
//   npm run radar           build the dashboard
//   npm run radar -- --open build and open it
import { exec } from "node:child_process"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { normalizeSources } from "./analyze.mts"
import { ENGINE_LABEL, ENGINES, type Answer, type ClientConfig, type Engine, type RunResult, type Source } from "./types.mts"

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0)
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

type CitedPage = Source & {
  count: number
  prompts: Set<string>
  /** Answers citing this page that also named the client */
  withClient: number
  competitors: Map<string, number>
}

type ClientView = {
  slug: string
  config: ClientConfig
  latest: RunResult
  previous?: RunResult
  runs: number
  pagesByEngine: Record<Engine, CitedPage[]>
  opportunities: (CitedPage & { engines: Set<Engine> })[]
}

function aggregatePages(answers: Answer[]) {
  const pages = new Map<string, CitedPage>()
  for (const a of answers) {
    for (const s of normalizeSources(a.sources)) {
      const key = s.url || s.domain
      const page = pages.get(key) ?? { ...s, count: 0, prompts: new Set(), withClient: 0, competitors: new Map() }
      page.count++
      page.prompts.add(a.prompt)
      if (a.named) page.withClient++
      for (const c of a.competitors) page.competitors.set(c, (page.competitors.get(c) ?? 0) + 1)
      if (!page.title && s.title) page.title = s.title
      pages.set(key, page)
    }
  }
  return [...pages.values()].sort((x, y) => y.count - x.count)
}

async function loadClient(slug: string): Promise<ClientView | null> {
  const config = JSON.parse(await readFile(path.join(ROOT, "clients", `${slug}.json`), "utf8")) as ClientConfig
  const dir = path.join(ROOT, "results", slug)
  const files = (await readdir(dir).catch(() => [] as string[])).filter((f) => f.endsWith(".json")).sort()
  if (!files.length) return null
  const runs = await Promise.all(files.slice(-2).map(async (f) => JSON.parse(await readFile(path.join(dir, f), "utf8")) as RunResult))
  const latest = runs[runs.length - 1]
  const ok = latest.answers.filter((a) => a.ok)

  const pagesByEngine = Object.fromEntries(ENGINES.map((e) => [e, aggregatePages(ok.filter((a) => a.engine === e))])) as Record<Engine, CitedPage[]>

  // Opportunities: pages cited in 2+ answers where the client is rarely named alongside them (under 25%).
  const all = new Map<string, CitedPage & { engines: Set<Engine> }>()
  for (const e of ENGINES) {
    for (const p of pagesByEngine[e]) {
      const key = p.url || p.domain
      const existing = all.get(key)
      if (existing) {
        existing.count += p.count
        existing.withClient += p.withClient
        for (const q of p.prompts) existing.prompts.add(q)
        for (const [c, n] of p.competitors) existing.competitors.set(c, (existing.competitors.get(c) ?? 0) + n)
        existing.engines.add(e)
      } else {
        all.set(key, { ...p, prompts: new Set(p.prompts), competitors: new Map(p.competitors), engines: new Set([e]) })
      }
    }
  }
  const opportunities = [...all.values()]
    .filter((p) => p.count >= 2 && p.withClient / p.count < 0.25)
    // Most-cited pages where you're most absent come first
    .sort((a, b) => b.count * (1 - b.withClient / b.count) - a.count * (1 - a.withClient / a.count))
    .slice(0, 15)

  return { slug, config, latest, previous: runs.length > 1 ? runs[0] : undefined, runs: files.length, pagesByEngine, opportunities }
}

// --- HTML ------------------------------------------------------------------------------------

function pageLink(p: Source) {
  const label = esc(p.title || p.domain)
  return /^https?:\/\//.test(p.url)
    ? `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${label}</a><div class="dom">${esc(p.domain)}</div>`
    : `${label}<div class="dom">${esc(p.domain)}</div>`
}

function competitorsCell(m: Map<string, number>) {
  const list = [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3)
  return list.length ? list.map(([c, n]) => `${esc(c)} <span class="muted">(${n})</span>`).join(", ") : `<span class="muted">none</span>`
}

function engineStat(v: ClientView, e: Engine) {
  const now = v.latest.summary.perEngine[e]
  if (!now || !now.total) return `<td class="num muted">not tracked</td>`
  const before = v.previous?.summary.perEngine[e]
  const delta = before?.total ? pct(now.named, now.total) - pct(before.named, before.total) : null
  return `<td class="num"><strong>${pct(now.named, now.total)}%</strong> <span class="muted">${now.named}/${now.total}</span>${
    delta === null ? "" : ` <span class="${delta >= 0 ? "up" : "down"}">${signed(delta)}pt</span>`
  }</td>`
}

function clientSection(v: ClientView) {
  const s = v.latest.summary
  const top = s.competitors[0]
  return `
  <section id="${esc(v.slug)}">
    <h2>${esc(v.config.name)} <span class="muted small">${esc(v.config.website)} · last run ${esc(v.latest.date)} · ${v.runs} run${v.runs === 1 ? "" : "s"}${s.demo ? ` · <span class="demo-tag">demo data</span>` : ""}</span></h2>

    <div class="cards">
      <div class="card"><div class="muted">Named in</div><div class="big">${s.namedPrompts}<span class="of"> / ${s.promptCount} prompts</span></div></div>
      ${ENGINES.map((e) => {
        const p = s.perEngine[e]
        return `<div class="card"><div class="muted">${ENGINE_LABEL[e]}</div><div class="big">${p?.total ? `${pct(p.named, p.total)}%` : "–"}</div><div class="bar"><div style="width:${p?.total ? pct(p.named, p.total) : 0}%"></div></div></div>`
      }).join("")}
      <div class="card"><div class="muted">Top competitor</div><div class="big small-big">${top ? esc(top.name) : "–"}</div><div class="muted">${top ? `${top.answers} answers` : ""}</div></div>
    </div>

    <h3>Opportunities <span class="muted small">pages AI cites for these prompts where ${esc(v.config.name)} is rarely named alongside (under 25% of answers)</span></h3>
    ${
      v.opportunities.length
        ? `<table><thead><tr><th>Page</th><th class="num">Cited</th><th class="num">With you</th><th>Engines</th><th>Competitors named alongside</th><th class="num">Prompts</th></tr></thead><tbody>${v.opportunities
            .map(
              (p) =>
                `<tr><td>${pageLink(p)}</td><td class="num">${p.count}</td><td class="num">${pct(p.withClient, p.count)}%</td><td>${[...p.engines].map((e) => ENGINE_LABEL[e].split(" ")[0]).join(", ")}</td><td>${competitorsCell(p.competitors)}</td><td class="num">${p.prompts.size}</td></tr>`,
            )
            .join("")}</tbody></table>`
        : `<p class="muted">No frequently cited pages where ${esc(v.config.name)} is missing. Nice.</p>`
    }

    <h3>Cited pages by engine</h3>
    <div class="engine-grid">
      ${ENGINES.map((e) => {
        const pages = v.pagesByEngine[e].slice(0, 15)
        return `<div><h4>${ENGINE_LABEL[e]}</h4>${
          pages.length
            ? `<table><thead><tr><th>Page</th><th class="num">Cited</th><th class="num">With you</th></tr></thead><tbody>${pages
                .map((p) => `<tr><td>${pageLink(p)}</td><td class="num">${p.count}</td><td class="num ${p.withClient ? "up" : "muted"}">${p.withClient}</td></tr>`)
                .join("")}</tbody></table>`
            : `<p class="muted">No citations recorded${v.latest.summary.perEngine[e]?.total ? "" : " (engine not tracked in this run)"}.</p>`
        }</div>`
      }).join("")}
    </div>
  </section>`
}

function buildHtml(views: ClientView[], skipped: string[]) {
  const date = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  const anyDemo = views.some((v) => v.latest.summary.demo)
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Samael Radar, ${esc(date)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; background: #faf8f4; color: #1c1917; font: 14px/1.5 "Inter Tight", "Geist", system-ui, -apple-system, sans-serif; }
  main { max-width: 1240px; margin: 0 auto; padding: 32px 24px 80px; }
  header { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; flex-wrap: wrap; border-bottom: 1px solid #e7e1d8; padding-bottom: 16px; }
  h1 { font-size: 26px; letter-spacing: -0.03em; margin: 0; }
  h2 { font-size: 22px; letter-spacing: -0.03em; margin: 48px 0 16px; padding-top: 24px; border-top: 1px solid #e7e1d8; }
  h3 { font-size: 15px; margin: 28px 0 10px; }
  h4 { font-size: 13px; margin: 0 0 8px; color: #6b625b; text-transform: uppercase; letter-spacing: .08em; }
  .muted { color: #6b625b; } .small { font-size: 13px; font-weight: 400; letter-spacing: 0; }
  .up { color: #1a7a5a; } .down { color: #b42318; }
  .demo { margin-top: 16px; padding: 10px 14px; border: 1px dashed #c9a227; background: #fffbea; border-radius: 10px; font-weight: 600; }
  .demo-tag { background: #fffbea; border: 1px dashed #c9a227; padding: 1px 6px; border-radius: 6px; }
  nav { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0 0; }
  nav a { padding: 6px 12px; border: 1px solid #e7e1d8; border-radius: 99px; background: #fff; color: inherit; text-decoration: none; font-size: 13px; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e7e1d8; border-radius: 10px; overflow: hidden; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #f0ece6; vertical-align: top; }
  th { font-size: 12px; color: #6b625b; font-weight: 600; background: #fcfbf8; }
  td.num, th.num { text-align: right; white-space: nowrap; font-variant-numeric: tabular-nums; }
  a { color: #1a7a5a; } .dom { font-size: 12px; color: #6b625b; }
  .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
  .card { background: #fff; border: 1px solid #e7e1d8; border-radius: 12px; padding: 14px; }
  .big { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; } .small-big { font-size: 18px; }
  .of { font-size: 14px; font-weight: 500; color: #6b625b; }
  .bar { height: 6px; background: #f0ece6; border-radius: 99px; overflow: hidden; margin-top: 8px; } .bar div { height: 100%; background: #1a7a5a; }
  .engine-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 16px; }
</style></head>
<body><main>
  <header>
    <h1>Samael Radar <span class="muted small">internal</span></h1>
    <div class="muted">${esc(date)} · ${views.length} client${views.length === 1 ? "" : "s"}</div>
  </header>
  ${anyDemo ? `<div class="demo">Some clients show demo data (API keys not set). Real exposure and citations appear once keys are added.</div>` : ""}

  <h3>Exposure by engine</h3>
  <table>
    <thead><tr><th>Client</th><th class="num">Named in</th>${ENGINES.map((e) => `<th class="num">${ENGINE_LABEL[e].split(" ")[0]}</th>`).join("")}<th>Top competitor</th><th class="num">Opportunities</th></tr></thead>
    <tbody>${views
      .map((v) => {
        const s = v.latest.summary
        const delta = v.previous ? s.namedPrompts - v.previous.summary.namedPrompts : null
        return `<tr><td><a href="#${esc(v.slug)}">${esc(v.config.name)}</a>${s.demo ? ` <span class="demo-tag">demo</span>` : ""}</td><td class="num"><strong>${s.namedPrompts}</strong>/${s.promptCount}${
          delta === null ? "" : ` <span class="${delta >= 0 ? "up" : "down"}">${signed(delta)}</span>`
        }</td>${ENGINES.map((e) => engineStat(v, e)).join("")}<td>${s.competitors[0] ? `${esc(s.competitors[0].name)} <span class="muted">(${s.competitors[0].answers})</span>` : "–"}</td><td class="num">${v.opportunities.length}</td></tr>`
      })
      .join("")}</tbody>
  </table>
  ${skipped.length ? `<p class="muted">No results yet for: ${skipped.map(esc).join(", ")}. Run <code>npm run track</code> first.</p>` : ""}
  <nav>${views.map((v) => `<a href="#${esc(v.slug)}">${esc(v.config.name)}</a>`).join("")}</nav>

  ${views.map(clientSection).join("")}
</main></body></html>`
}

async function main() {
  const slugs = (await readdir(path.join(ROOT, "clients")).catch(() => [] as string[]))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))
  if (!slugs.length) {
    console.log("No clients yet. Add one in tracker/clients/ (see tracker/README.md), run npm run track, then npm run radar.")
    return
  }
  const views: ClientView[] = []
  const skipped: string[] = []
  for (const slug of slugs) {
    const v = await loadClient(slug)
    if (v) views.push(v)
    else skipped.push(slug)
  }
  if (!views.length) {
    console.log(`No tracker results yet for ${skipped.join(", ")}. Run npm run track first.`)
    return
  }

  const dir = path.join(ROOT, "reports", "_radar")
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, `radar-${new Date().toLocaleDateString("en-CA")}.html`)
  await writeFile(file, buildHtml(views, skipped))
  console.log(`Radar: ${views.length} client${views.length === 1 ? "" : "s"}${skipped.length ? ` (no results yet: ${skipped.join(", ")})` : ""}`)
  console.log(`  ${path.relative(process.cwd(), file)}`)
  if (process.argv.includes("--open")) exec(`open "${file}"`)
}

main().catch((err) => {
  console.error(`\nRadar failed: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
