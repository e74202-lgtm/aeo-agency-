import Link from "next/link"

import { Logo } from "@/components/logo"
import { site } from "@/lib/site"

const columns = [
  { title: "Company", links: site.nav.filter((item) => item.href !== "/what-is-aeo") },
  { title: "Learn", links: [{ label: "What is AEO?", href: "/what-is-aeo" }, { label: "FAQ", href: "/#faq" }] },
  { title: "Get started", links: [site.cta, { label: "Contact", href: "/contact" }] },
]

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-sm space-y-4">
          <Logo />
          <p className="text-sm leading-relaxed text-muted-foreground">{site.description}</p>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title} className="space-y-4 text-sm">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{col.title}</p>
            <ul className="space-y-1">
              {col.links.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-block py-1.5 transition-colors hover:text-signal">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-2 border-t px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>Built to be the answer.</p>
      </div>
    </footer>
  )
}
