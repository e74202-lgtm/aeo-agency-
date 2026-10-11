import Link from "next/link"

import { site } from "@/lib/site"

// Placeholder mark: a speech bubble with a signal dot (an answer, highlighted).
export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 rounded-full">
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden="true">
        <path
          d="M14 3C7.9 3 3 7.4 3 12.9c0 3 1.5 5.7 3.9 7.5L6 25l4.9-2.5c1 .3 2 .4 3.1.4 6.1 0 11-4.4 11-9.9S20.1 3 14 3Z"
          className="fill-foreground"
        />
        <circle cx="14" cy="13" r="3.2" className="fill-signal-bright transition-transform duration-300 group-hover:scale-110" style={{ transformOrigin: "14px 13px" }} />
      </svg>
      <span className="text-[15px] font-semibold tracking-tight">{site.name}</span>
    </Link>
  )
}
