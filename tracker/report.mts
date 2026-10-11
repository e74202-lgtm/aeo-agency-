// Builds the weekly client report: one self-contained HTML file, designed to print to PDF.
import type { Changes } from "./analyze.mts"
import { ENGINE_LABEL, ENGINES, type Answer, type ClientConfig, type RunResult, type Summary } from "./types.mts"

const AGENCY = "Samael"

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`)

function deltaBadge(n: number | null | undefined, goodWhenUp = true) {
  if (n === null || n === undefined || n === 0) return `<span class="delta flat">${n === 0 ? "no change" : "first week"}</span>`
  const good = goodWhenUp ? n > 0 : n < 0
  return `<span class="delta ${good ? "up" : "down"}">${signed(n)} vs last week</span>`
}

function sparkline(history: Summary[]) {
  if (history.length < 2) return ""
  const w = 220
  const h = 48
  const max = Math.max(...history.map((s) => s.promptCount), 1)
  const step = w / (history.length - 1)
  const pts = history.map((s, i) => `${(i * step).toFixed(1)},${(h - (s.namedPrompts / max) * h).toFixed(1)}`)
  const last = pts[pts.length - 1].split(",")
  return `<svg width="${w}" height="${h + 4}" viewBox="0 -2 ${w} ${h + 4}" aria-label="Trend over the last ${history.length} weeks">
    <polyline points="${pts.join(" ")}" fill="none" stroke="#1a7a5a" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${last[0]}" cy="${last[1]}" r="4" fill="#1a7a5a"/>
  </svg>`
}

function bar(value: number, total: number) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return `<div class="bar"><div style="width:${pct}%"></div></div>`
}

export function buildReport(opts: {
  client: ClientConfig
  run: RunResult
  changes: Changes
  history: Summary[]
  /** Sample report for prospects: fictional client, illustrative data */
  sample?: boolean
}) {
  const { client, run, changes, history, sample } = opts
  const s = run.summary
  const date = new Date(`${run.date}T12:00:00`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  // Prompt-by-prompt grid
  const byPrompt = new Map<number, { prompt: string; cells: Partial<Record<string, Answer>> }>()
  for (const a of run.answers) {
    const row = byPrompt.get(a.promptIndex) ?? { prompt: a.prompt, cells: {} }
    row.cells[a.engine] = a
    byPrompt.set(a.promptIndex, row)
  }
  const cell = (a?: Answer) =>
    !a || !a.ok ? `<td class="na">n/a</td>` : a.named ? `<td class="yes">Named</td>` : `<td class="no">-</td>`

  const competitorRows = s.competitors.length
    ? s.competitors
        .map(
          (c) => `<tr><td>${esc(c.name)}</td><td class="num">${c.answers}</td><td>${bar(c.answers, s.perEngine.chatgpt.total + s.perEngine.gemini.total)}</td><td class="num">${
            changes.namedDelta === null ? "" : signed(changes.competitorDelta[c.name] ?? 0)
          }</td></tr>`,
        )
        .join("")
    : `<tr><td colspan="4" class="muted">No competitors listed in the client settings.</td></tr>`

  const list = (items: string[], empty: string) =>
    items.length ? `<ul>${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : `<p class="muted">${empty}</p>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(client.name)}: AI visibility report, ${esc(date)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #faf8f4; color: #1c1917; font: 14px/1.55 "Inter Tight", "Geist", system-ui, -apple-system, "Segoe UI", sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  main { max-width: 860px; margin: 0 auto; padding: 40px 28px 64px; }
  header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e7e1d8; padding-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 18px; letter-spacing: -0.02em; }
  .meta { text-align: right; color: #6b625b; font-size: 13px; }
  h1 { font-size: 34px; line-height: 1.05; letter-spacing: -0.04em; margin: 32px 0 6px; }
  h2 { font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; color: #6b625b; margin: 36px 0 12px; font-weight: 600; }
  .hero { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-top: 20px; }
  .card { background: #fff; border: 1px solid #e7e1d8; border-radius: 16px; padding: 20px; break-inside: avoid; }
  .big { font-size: 44px; font-weight: 800; letter-spacing: -0.04em; line-height: 1; }
  .big em { font-style: normal; color: #1a7a5a; }
  .muted { color: #6b625b; }
  .delta { display: inline-block; margin-top: 10px; font-size: 12px; padding: 3px 10px; border-radius: 99px; background: #f0ece6; }
  .delta.up { background: #e3f3ec; color: #1a7a5a; }
  .delta.down { background: #fbe9e7; color: #b42318; }
  .engines { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; }
  .bar { height: 8px; background: #f0ece6; border-radius: 99px; overflow: hidden; min-width: 80px; }
  .bar div { height: 100%; background: #1a7a5a; border-radius: 99px; }
  .alerts { background: #fff7ed; border-color: #f5d9b8; }
  .alerts li { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; background: #fff; border: 1px solid #e7e1d8; border-radius: 12px; overflow: hidden; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #f0ece6; vertical-align: top; }
  th { font-size: 12px; color: #6b625b; font-weight: 600; background: #fcfbf8; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  td.yes { color: #1a7a5a; font-weight: 600; white-space: nowrap; }
  td.no, td.na { color: #a39a92; white-space: nowrap; }
  tr { break-inside: avoid; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  ul { margin: 0; padding-left: 18px; }
  .demo.sample { border-color: #1a7a5a; background: #e3f3ec; color: #12583f; }
  .demo { margin-top: 20px; padding: 12px 16px; border: 1px dashed #c9a227; background: #fffbea; border-radius: 12px; font-weight: 600; }
  footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e7e1d8; color: #6b625b; font-size: 12px; }
  @media print { main { padding: 0; } .card, table { box-shadow: none; } }
</style>
</head>
<body>
<main>
  <header>
    <div class="brand">
      <svg width="26" height="26" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3C7.9 3 3 7.4 3 12.9c0 3 1.5 5.7 3.9 7.5L6 25l4.9-2.5c1 .3 2 .4 3.1.4 6.1 0 11-4.4 11-9.9S20.1 3 14 3Z" fill="#1c1917"/><circle cx="14" cy="13" r="3.2" fill="#3ecf9a"/></svg>
      ${AGENCY}
    </div>
    <div class="meta">Weekly AI visibility report<br>${esc(date)}</div>
  </header>

  ${
    sample
      ? `<div class="demo sample">Sample report: fictional brand and illustrative data, to show what a weekly report looks like. Not real results.</div>`
      : s.demo
        ? `<div class="demo">Demo data: some answers are samples because API keys aren't set. Don't send this report to a client.</div>`
        : ""
  }

  <h1>${esc(client.name)}</h1>
  <p class="muted">${s.promptCount} buyer questions asked on ${ENGINES.map((e) => ENGINE_LABEL[e]).join(" and ")}.</p>

  <div class="hero">
    <div class="card">
      <div class="muted">Named in</div>
      <div class="big"><em>${s.namedPrompts}</em> of ${s.promptCount} prompts</div>
      ${deltaBadge(changes.namedDelta)}
    </div>
    <div class="card">
      <div class="muted">Trend</div>
      ${sparkline(history) || `<p class="muted">The trend line appears after the second week.</p>`}
    </div>
  </div>

  <div class="engines">
    ${ENGINES.map((e) => {
      const p = s.perEngine[e]
      return `<div class="card"><div style="display:flex;justify-content:space-between"><strong>${ENGINE_LABEL[e]}</strong><span class="num">${p.named}/${p.total}</span></div>${bar(p.named, p.total)}</div>`
    }).join("")}
  </div>

  ${changes.alerts.length ? `<h2>Alerts</h2><div class="card alerts">${list(changes.alerts, "")}</div>` : ""}

  <h2>Competitors</h2>
  <table>
    <thead><tr><th>Competitor</th><th class="num">Answers</th><th>Share</th><th class="num">Change</th></tr></thead>
    <tbody>${competitorRows}</tbody>
  </table>

  <div class="cols">
    <div>
      <h2>Sources AI cited most</h2>
      ${
        s.topSources.length
          ? `<table><thead><tr><th>Site</th><th class="num">Answers</th></tr></thead><tbody>${s.topSources
              .map((t) => `<tr><td>${esc(t.domain)}</td><td class="num">${t.count}</td></tr>`)
              .join("")}</tbody></table>`
          : `<p class="muted">No sources were cited.</p>`
      }
    </div>
    <div>
      <h2>Your citations</h2>
      <div class="card"><div class="big"><em>${s.citedAnswers}</em></div><div class="muted">answers cited ${esc(client.website)} as a source</div></div>
      <h2>Changes this week</h2>
      <div class="card">
        <strong>Newly named (${changes.wins.length})</strong>
        ${list(changes.wins.slice(0, 8), changes.namedDelta === null ? "Available from next week." : "None this week.")}
        <br><strong>No longer named (${changes.losses.length})</strong>
        ${list(changes.losses.slice(0, 8), changes.namedDelta === null ? "Available from next week." : "None this week.")}
      </div>
    </div>
  </div>

  <h2>Every prompt</h2>
  <table>
    <thead><tr><th>#</th><th>Buyer question</th>${ENGINES.map((e) => `<th>${ENGINE_LABEL[e].split(" ")[0]}</th>`).join("")}</tr></thead>
    <tbody>
      ${[...byPrompt.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([i, row]) => `<tr><td class="num">${i + 1}</td><td>${esc(row.prompt)}</td>${ENGINES.map((e) => cell(row.cells[e])).join("")}</tr>`)
        .join("")}
    </tbody>
  </table>

  <footer>
    Answers come from the official ChatGPT and Gemini APIs with web search turned on. AI answers vary from run to run and can
    differ slightly from what people see in the apps, so week-over-week trends matter more than any single answer.
    ${s.failed ? `${s.failed} answer${s.failed === 1 ? "" : "s"} failed to load this week and ${s.failed === 1 ? "is" : "are"} excluded.` : ""}
    <br>Prepared by ${AGENCY}.
  </footer>
</main>
</body>
</html>`
}
