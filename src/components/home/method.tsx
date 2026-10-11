import { SectionLabel } from "@/components/home/section-label"
import { steps } from "@/lib/site"

export function Method() {
  return (
    <section id="method" className="scroll-mt-16 border-t">
      <div className="mx-auto max-w-6xl px-5 py-24 md:py-32">
        <div className="reveal flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-6">
            <SectionLabel>The method</SectionLabel>
            <h2 className="max-w-2xl font-display text-4xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl text-balance lg:text-6xl">
              Four moves to become the default recommendation.
            </h2>
          </div>
          <p className="max-w-xs text-muted-foreground">
            Same playbook for every client, tuned to the questions your buyers actually ask.
          </p>
        </div>

        <ol className="mt-16 grid gap-px overflow-hidden rounded-3xl border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="reveal group flex flex-col gap-10 bg-background p-7 transition-colors hover:bg-card">
              <span className="font-mono text-sm text-signal">0{i + 1}</span>
              <div className="space-y-3">
                <h3 className="font-display text-2xl leading-tight font-semibold tracking-[-0.03em]">{step.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
