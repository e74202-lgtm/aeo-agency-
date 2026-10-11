import { SectionLabel } from "@/components/home/section-label"
import { StatCards } from "@/components/stat-cards"
import { stats } from "@/lib/site"

const rows = [
  { label: "The goal", seo: "Rank on page one", aeo: "Be named in the answer" },
  { label: "Built around", seo: "Keywords", aeo: "Questions and entities" },
  { label: "Trust signal", seo: "Backlinks", aeo: "Citations and mentions" },
  { label: "The win", seo: "A click", aeo: "The recommendation" },
]

export function Shift() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 md:py-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-20">
      <div className="reveal space-y-6">
        <SectionLabel>The shift</SectionLabel>
        <h2 className="font-display text-4xl leading-[1.02] font-semibold tracking-[-0.04em] sm:text-5xl text-balance lg:text-6xl">
          Search gave ten links. AI gives <em className="text-signal">one answer.</em>
        </h2>
        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
          Your buyers are asking AI to shortlist vendors for them. If you&apos;re not in that answer, you&apos;re
          not on the list, no matter where you rank on Google.
        </p>
      </div>

      <div className="reveal overflow-hidden rounded-3xl border bg-card shadow-sm">
        <table className="w-full text-left text-[15px]">
          <caption className="sr-only">How AEO differs from SEO</caption>
          <thead>
            <tr className="border-b">
              <th scope="col" className="p-4 sm:p-5 font-normal"><span className="sr-only">Aspect</span></th>
              <th scope="col" className="p-4 sm:p-5 font-mono text-[11px] font-normal tracking-[0.18em] text-muted-foreground uppercase">SEO</th>
              <th scope="col" className="bg-signal/[0.07] p-4 sm:p-5 font-mono text-[11px] font-normal tracking-[0.18em] text-signal uppercase">AEO</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-0">
                <th scope="row" className="p-4 sm:p-5 align-top text-sm font-normal text-muted-foreground">{row.label}</th>
                <td className="p-4 sm:p-5 align-top text-muted-foreground">{row.seo}</td>
                <td className="bg-signal/[0.07] p-4 sm:p-5 align-top font-medium">{row.aeo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      <StatCards items={stats} className="reveal mt-16" />
    </section>
  )
}
