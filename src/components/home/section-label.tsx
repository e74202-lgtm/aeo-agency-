export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">
      <span className="h-px w-6 bg-signal" aria-hidden="true" />
      {children}
    </p>
  )
}
