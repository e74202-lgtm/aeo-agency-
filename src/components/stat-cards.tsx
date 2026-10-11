import { ArrowUpRight } from "lucide-react"

type Stat = { value: string; label: string; source: string; href: string }

// A row of sourced statistics. Each card links to its source, so the number can be verified.
export function StatCards({ items, className = "" }: { items: Stat[]; className?: string }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-2 ${items.length > 3 ? "lg:grid-cols-4" : "lg:grid-cols-3"} ${className}`}>
      {items.map((stat) => (
        <li key={stat.value} className="flex flex-col justify-between gap-5 rounded-2xl border bg-card p-6">
          <div className="space-y-2">
            <p className="font-display text-4xl font-semibold tracking-[-0.04em] text-signal tabular-nums">{stat.value}</p>
            <p className="leading-snug">{stat.label}</p>
          </div>
          <a
            href={stat.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            Source: {stat.source}
            <ArrowUpRight className="mt-px size-3 shrink-0" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  )
}
