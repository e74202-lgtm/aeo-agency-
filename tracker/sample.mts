// Sample report for prospects: `npm run track -- --sample --open`
// Uses the fictional example client, expands it to 150 prompts, and simulates 8 weeks of history
// with a rising trend. Always demo data (no API calls, no cost), never saved to client history.
import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { compare, isCited, isNamed, mentions, summarize } from "./analyze.mts"
import { demoAnswer } from "./engines.mts"
import { buildReport } from "./report.mts"
import { ENGINES, type Answer, type ClientConfig, type RunResult } from "./types.mts"

const VARIATIONS = [
  "",
  " in 2026",
  " for a remote team",
  " for SaaS companies",
  " for e-commerce brands",
  " on a budget",
  " with tax prep included",
  " for a first-time founder",
  " that works with QuickBooks",
  " for a fast-growing team",
]

/** 15 base questions x 10 variations = 150 prompts, like a real Monitor client. */
function expandPrompts(base: string[]) {
  return VARIATIONS.flatMap((v) =>
    base.map((p) => {
      if (!v) return p
      const question = p.trim().endsWith("?")
      return `${p.trim().replace(/\?$/, "")}${v}${question ? "?" : ""}`
    }),
  ).slice(0, 150)
}

function simulateWeek(client: ClientConfig, brandChance: number, date: string): RunResult {
  const answers: Answer[] = client.prompts.flatMap((prompt, promptIndex) =>
    ENGINES.map((engine) => {
      const { text, sources } = demoAnswer(engine, client, promptIndex, brandChance)
      return {
        promptIndex,
        prompt,
        engine,
        ok: true,
        demo: true,
        named: isNamed(text, client),
        cited: isCited(sources, client),
        competitors: client.competitors.filter((c) => mentions(text, [c.name, ...(c.aliases ?? [])])).map((c) => c.name),
        sources,
        text,
      }
    }),
  )
  return { client: client.name, date, answers, summary: summarize(client, answers) }
}

export async function buildSampleReport(root: string) {
  const example = JSON.parse(
    await readFile(path.join(root, "clients.example", "northwind-books.json"), "utf8"),
  ) as ClientConfig
  const client: ClientConfig = { ...example, prompts: expandPrompts(example.prompts) }

  // 8 weekly runs, the brand showing up a little more often each week.
  const today = new Date()
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (7 - i) * 7)
    return simulateWeek(client, 0.06 + i * 0.03, d.toLocaleDateString("en-CA"))
  })
  const current = weeks[weeks.length - 1]
  const changes = compare(current, weeks[weeks.length - 2])

  const html = buildReport({ client, run: current, changes, history: weeks.map((w) => w.summary), sample: true })
  const dir = path.join(root, "reports", "_sample")
  await mkdir(dir, { recursive: true })
  const file = path.join(dir, `sample-report-${current.date}.html`)
  await writeFile(file, html)

  console.log(`Sample report (fictional client, illustrative data):`)
  console.log(`  Named in ${current.summary.namedPrompts} of ${current.summary.promptCount} prompts`)
  console.log(`  Report: ${path.relative(process.cwd(), file)}`)
  return file
}
