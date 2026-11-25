"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/admin/automation", label: "Overview" },
  { href: "/admin/automation/sources", label: "Sources" },
  { href: "/admin/automation/review", label: "Review Queue" },
  { href: "/admin/automation/history", label: "Sync History" },
  { href: "/admin/automation/usage", label: "API Usage" },
];

export function AutomationNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Automation Center" className="no-scrollbar relative mt-4 flex gap-1.5 overflow-x-auto border-b border-border-faint pb-3">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-10 shrink-0 items-center rounded-xl px-3.5 text-sm font-medium transition-colors",
              active ? "bg-gold/12 text-gold ring-1 ring-gold/30" : "text-offwhite/75 hover:bg-surface hover:text-offwhite",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
