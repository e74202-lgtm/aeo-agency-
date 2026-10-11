import { hostname } from "./engines.mts"
import { ENGINES, type Answer, type ClientConfig, type Summary } from "./types.mts"

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/** True if any of the names appears as a whole word (case-insensitive, works with accents). */
export function mentions(text: string, names: string[]) {
  return names.some((n) => {
    const name = n.trim()
    return name ? new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(name)}($|[^\\p{L}\\p{N}])`, "iu").test(text) : false
  })
}

export function brandNames(client: ClientConfig) {
  return [client.name, ...(client.aliases ?? [])]
}

export function isNamed(text: string, client: ClientConfig) {
  return mentions(text, brandNames(client)) || text.toLowerCase().includes(hostname(client.website))
}

export function isCited(sources: string[], client: ClientConfig) {
  const own = hostname(client.website)
  return sources.some((d) => d === own || d.endsWith(`.${own}`))
}

export function summarize(client: ClientConfig, answers: Answer[]): Summary {
  const ok = answers.filter((a) => a.ok)
  const promptCount = new Set(answers.map((a) => a.promptIndex)).size
  const namedPrompts = new Set(ok.filter((a) => a.named).map((a) => a.promptIndex)).size

  const perEngine = Object.fromEntries(
    ENGINES.map((e) => {
      const list = ok.filter((a) => a.engine === e)
      return [e, { named: list.filter((a) => a.named).length, total: list.length }]
    }),
  ) as Summary["perEngine"]

  const competitors = client.competitors
    .map((c) => ({ name: c.name, answers: ok.filter((a) => a.competitors.includes(c.name)).length }))
    .sort((a, b) => b.answers - a.answers)

  const own = hostname(client.website)
  const counts = new Map<string, number>()
  for (const a of ok) for (const d of a.sources) if (d !== own) counts.set(d, (counts.get(d) ?? 0) + 1)
  const topSources = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([domain, count]) => ({ domain, count }))

  return {
    promptCount,
    namedPrompts,
    perEngine,
    citedAnswers: ok.filter((a) => a.cited).length,
    competitors,
    topSources,
    failed: answers.length - ok.length,
    demo: answers.some((a) => a.demo),
  }
}

export type Changes = {
  namedDelta: number | null
  competitorDelta: Record<string, number>
  alerts: string[]
  wins: string[]
  losses: string[]
}

/** Compares this run with the previous one: alerts, newly won and newly lost prompts. */
export function compare(current: { answers: Answer[]; summary: Summary }, previous?: { answers: Answer[]; summary: Summary }): Changes {
  if (!previous) return { namedDelta: null, competitorDelta: {}, alerts: [], wins: [], losses: [] }

  const namedSet = (answers: Answer[]) => new Set(answers.filter((a) => a.ok && a.named).map((a) => a.prompt))
  const okPrompts = (answers: Answer[]) => new Set(answers.filter((a) => a.ok).map((a) => a.prompt))
  const now = namedSet(current.answers)
  const before = namedSet(previous.answers)
  const askedBoth = okPrompts(previous.answers)

  const wins = [...now].filter((p) => askedBoth.has(p) && !before.has(p))
  const losses = [...before].filter((p) => okPrompts(current.answers).has(p) && !now.has(p))

  const prevComp = Object.fromEntries(previous.summary.competitors.map((c) => [c.name, c.answers]))
  const competitorDelta: Record<string, number> = {}
  const alerts: string[] = []
  for (const c of current.summary.competitors) {
    const delta = c.answers - (prevComp[c.name] ?? 0)
    competitorDelta[c.name] = delta
    // Alert on a meaningful jump: at least 3 more answers, or a brand-new appearance.
    if (delta >= 3 || (delta > 0 && !prevComp[c.name])) {
      alerts.push(`${c.name} appeared in ${delta} more answer${delta === 1 ? "" : "s"} than last week.`)
    }
  }
  const namedDelta = current.summary.namedPrompts - previous.summary.namedPrompts
  if (namedDelta <= -3) alerts.unshift(`You dropped out of ${-namedDelta} prompts since last week.`)

  return { namedDelta, competitorDelta, alerts, wins, losses }
}
