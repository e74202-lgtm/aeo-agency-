import Link from "next/link"
import { ArrowUpRight, Menu } from "lucide-react"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { site } from "@/lib/site"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild className="h-10 rounded-full px-4 text-sm">
            <Link href={site.cta.href}>
              {site.cta.label}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>

          {/* Mobile menu: <details> opens and closes without any JavaScript */}
          <details className="group relative md:hidden">
            <summary
              aria-label="Menu"
              className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border hover:bg-muted [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 mt-2 flex w-56 flex-col rounded-2xl border bg-card p-2 text-[15px] shadow-xl shadow-foreground/5"
            >
              {site.nav.map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl px-3 py-3 hover:bg-muted">
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  )
}
