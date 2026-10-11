// Weekly AI visibility tracker.
//
//   npm run track                     run every client in tracker/clients/
//   npm run track -- northwind-books  run one client (the file name without .json)
//   npm run track -- --limit 5        only the first 5 prompts (cheap test)
//   npm run track -- --open           open the report(s) when done
//   npm run track -- --sample --open  sample report for prospects (fictional client, free, not saved to history)
//
// Client settings, results and reports stay in tracker/clients, tracker/results and tracker/reports,
// which are ignored by git so client data never reaches GitHub.
import { exec } from "node:child_process"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { compare, isCited, isNamed, mentions, summarize } from "./analyze.mts"
import { askEngine, engineIsLive } from "./engines.mts"
import { buildReport } from "./report.mts"
import { buildSampleReport } from "./sample.mts"
import { ENGINES, type Answer, type ClientConfig, type RunResult } from "./types.mts"

const ROOT = path.dirname(new URL(import.meta.url).pathname)
const CLIENTS_DIR = path.join(ROOT, "clients")
const RESULTS_DIR = path.join(ROOT, "results")
const REPORTS_DIR = path.join(ROOT, "reports")
const CONCURRENCY = 6

// --- command-line options ------------------------------------------------------------------

const args = process.argv.slice(2)
const flag = (name: string) => args.includes(name)
const limitIndex = args.indexOf("--limit")
const limit = limitIndex >= 0 ? Number(args[limitIndex + 1]) : undefined
const only = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--limit")

// --- helpers -------------------------------------------------------------------------------

async function pool<T>(tasks: (() => Promise<T>)[], size: number, onDone: () => void) {
  const results: T[] = new Array(tasks.length)
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
      onDone()
    }
  }
  await Promise.all(Array.from({ length: Math.min(size, tasks.length) }, worker))
  return results
}

async function withRetry<T>(fn: () => Promise<T>, tries = 2): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    if (tries <= 1) throw err
    await new Promise((r) => setTimeout(r, 3000))
    return withRetry(fn, tries - 1)
  }
}

function validate(slug: string, c: ClientConfig) {
  const problems: string[] = []
  if (!c.name) problems.push("missing \"name\"")
  if (!c.website) problems.push("missing \"website\"")
  if (!Array.isArray(c.prompts) || c.prompts.length === 0) problems.push("\"prompts\" must be a non-empty list")
  if (!Array.isArray(c.competitors)) problems.push("\"competitors\" must be a list (it can be empty: [])")
  if (problems.length) throw new Error(`tracker/clients/${slug}.json: ${problems.join(", ")}`)
}

async function loadPrevious(slug: string): Promise<RunResult[]> {
  const dir = path.join(RESULTS_DIR, slug)
  const files = (await readdir(dir).catch(() => [] as string[])).filter((f) => f.endsWith(".json")).sort()
  return Promise.all(files.map(async (f) => JSON.parse(await readFile(path.join(dir, f), "utf8")) as RunResult))
}

// --- one client ----------------------------------------------------------------------------

async function trackClient(slug: string) {
  const client = JSON.parse(await readFile(path.join(CLIENTS_DIR, `${slug}.json`), "utf8")) as ClientConfig
  validate(slug, client)
  const prompts = client.prompts.slice(0, limit ?? client.prompts.length)
  const date = new Date().toLocaleDateString("en-CA") // local YYYY-MM-DD

  const total = prompts.length * ENGINES.length
  let done = 0
  const progress = () => {
    done++
    process.stdout.write(`\r  ${client.name}: ${done}/${total} answers`)
  }

  const tasks = prompts.flatMap((prompt, promptIndex) =>
    ENGINES.map((engine) => async (): Promise<Answer> => {
      try {
        const reply = await withRetry(() => askEngine(engine, prompt, client, promptIndex))
        return {
          promptIndex,
          prompt,
          engine,
          ok: true,
          demo: reply.demo,
          named: isNamed(reply.text, client),
          cited: isCited(reply.sources, client),
          competitors: client.competitors.filter((c) => mentions(reply.text, [c.name, ...(c.aliases ?? [])])).map((c) => c.name),
          sources: reply.sources,
          text: reply.text.slice(0, 2000),
        }
      } catch (err) {
        console.error(`\n  ! ${engine} failed on "${prompt.slice(0, 50)}": ${err instanceof Error ? err.message : err}`)
        return { promptIndex, prompt, engine, ok: false, demo: false, named: false, cited: false, competitors: [], sources: [], text: "" }
      }
    }),
  )

  const answers = await pool(tasks, CONCURRENCY, progress)
  process.stdout.write("\n")

  const summary = summarize(client, answers)
  const run: RunResult = { client: client.name, date, answers, summary }

  // Compare against the latest earlier run (a re-run on the same day replaces that day's file).
  const history = (await loadPrevious(slug)).filter((r) => r.date !== date)
  const changes = compare(run, history[history.length - 1])

  await mkdir(path.join(RESULTS_DIR, slug), { recursive: true })
  await writeFile(path.join(RESULTS_DIR, slug, `${date}.json`), JSON.stringify(run, null, 2))

  const html = buildReport({ client, run, changes, history: [...history.slice(-7).map((r) => r.summary), summary] })
  await mkdir(path.join(REPORTS_DIR, slug), { recursive: true })
  const reportPath = path.join(REPORTS_DIR, slug, `${date}.html`)
  await writeFile(reportPath, html)

  const delta = changes.namedDelta === null ? "first run" : `${changes.namedDelta >= 0 ? "+" : ""}${changes.namedDelta} vs last week`
  console.log(`  Named in ${summary.namedPrompts} of ${summary.promptCount} prompts (${delta})${summary.demo ? "  [DEMO DATA]" : ""}`)
  for (const alert of changes.alerts) console.log(`  ⚠ ${alert}`)
  console.log(`  Report: ${path.relative(process.cwd(), reportPath)}`)
  return reportPath
}

// --- main ----------------------------------------------------------------------------------

async function main() {
  if (flag("--sample")) {
    const file = await buildSampleReport(ROOT)
    if (flag("--open")) exec(`open "${file}"`)
    return
  }

  const available = (await readdir(CLIENTS_DIR).catch(() => [] as string[]))
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""))

  if (available.length === 0) {
    console.log("No clients yet. Copy an example to get started:\n")
    console.log("  mkdir -p tracker/clients && cp tracker/clients.example/northwind-books.json tracker/clients/\n")
    console.log("Then edit it with your client's name, website, competitors and prompts, and run: npm run track")
    return
  }

  const slugs = only.length ? only : available
  const missing = slugs.filter((s) => !available.includes(s))
  if (missing.length) throw new Error(`No client file for: ${missing.join(", ")}. Available: ${available.join(", ")}`)

  const live = ENGINES.filter(engineIsLive)
  console.log(
    live.length === ENGINES.length
      ? "Engines: live (ChatGPT + Gemini)"
      : `Engines: ${live.length ? `live for ${live.join(", ")}, ` : ""}DEMO for ${ENGINES.filter((e) => !live.includes(e)).join(", ")} (add API keys to .env.local for real data)`,
  )
  if (limit) console.log(`Test mode: first ${limit} prompts only`)

  const reports: string[] = []
  for (const slug of slugs) {
    console.log(`\n▸ ${slug}`)
    reports.push(await trackClient(slug))
  }
  if (flag("--open")) for (const r of reports) exec(`open "${r}"`)
}

main().catch((err) => {
  console.error(`\nTracker failed: ${err instanceof Error ? err.message : err}`)
  process.exit(1)
})
