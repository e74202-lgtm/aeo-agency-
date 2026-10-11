import { engines } from "@/lib/site"

export function Engines() {
  return (
    <section aria-label="AI engines we optimize for" className="border-y bg-card/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-10 lg:flex-row lg:justify-between">
        <p className="shrink-0 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
          Optimized for
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 font-display text-lg font-semibold tracking-[-0.02em] text-foreground/60 sm:text-xl">
          {engines.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
