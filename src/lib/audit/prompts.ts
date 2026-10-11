import type { AuditInput } from "./types"

// Buyer questions that never mention the brand itself. Asking "is <brand> good?"
// always gets the brand named, which would inflate the score.
export function buildPrompts({ category, competitor }: AuditInput): string[] {
  const c = category.trim()
  return [
    `What's the best ${c}?`,
    `Which ${c} would you recommend?`,
    `Who are the top-rated ${c} right now?`,
    `What ${c} do experts recommend?`,
    `What's the most trusted ${c}?`,
    `What's an affordable but good ${c}?`,
    `What ${c} is best for a small business?`,
    competitor?.trim()
      ? `What are the best alternatives to ${competitor.trim()}?`
      : `What ${c} has the best reviews?`,
  ]
}
