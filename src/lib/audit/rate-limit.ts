// Simple in-memory limits to stop abuse running up the API bill.
// Note: on Vercel each server instance has its own memory, so these are "best effort".
// For hard limits at scale, move this to a shared store (e.g. Upstash Redis).

const DAY_MS = 24 * 60 * 60 * 1000
const hits = new Map<string, number[]>()
let daily = { date: "", count: 0 }

/** Allows `max` hits per key in a rolling 24 hours. */
export function allow(key: string, max: number) {
  const now = Date.now()
  const recent = (hits.get(key) ?? []).filter((t) => now - t < DAY_MS)
  if (recent.length >= max) {
    hits.set(key, recent)
    return false
  }
  recent.push(now)
  hits.set(key, recent)
  return true
}

/** Caps total live audits per day across everyone (protects your API spend). */
export function withinDailyCap() {
  const cap = Number(process.env.AUDIT_DAILY_CAP) || 50
  const today = new Date().toISOString().slice(0, 10)
  if (daily.date !== today) daily = { date: today, count: 0 }
  if (daily.count >= cap) return false
  daily.count++
  return true
}
