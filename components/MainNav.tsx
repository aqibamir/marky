"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PieChartIcon,
  CountdownTimerIcon,
  FileTextIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";

const ITEMS = [
  { href: "/practice", label: "Practice", Icon: FileTextIcon },
  { href: "/history", label: "History", Icon: CountdownTimerIcon },
  { href: "/insights", label: "Insights", Icon: PieChartIcon },
  { href: "/cheatsheet", label: "Cheat sheet", Icon: ReaderIcon },
];

function useIsCurrent() {
  const pathname = usePathname();
  return (href: string) => pathname === href || pathname.startsWith(`${href}/`);
}

// Desktop: section links inline in the header.
export function TopNav() {
  const isCurrent = useIsCurrent();
  return (
    <nav aria-label="Main" className="hidden md:flex gap-0.5">
      {ITEMS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent(href) ? "page" : undefined}
          className={`h-9 inline-flex items-center px-3 rounded-[10px] text-[15px] font-medium transition-colors ${
            isCurrent(href)
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

// Phones: a fixed bottom tab bar, the current tab marked with a yellow
// indicator. Pages clear it with the .pb-tabbar utility.
export function TabBar() {
  const isCurrent = useIsCurrent();
  return (
    <nav
      aria-label="Main"
      className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-background shadow-bar safe-bottom print:hidden"
    >
      <div className="grid grid-cols-4 h-16">
        {ITEMS.map(({ href, label, Icon }) => {
          const current = isCurrent(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={current ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center gap-1 text-xs font-semibold transition-colors ${
                current ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {current && (
                <span className="absolute top-0 inset-x-[30%] h-[3px] rounded-b bg-signal" aria-hidden="true" />
              )}
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
