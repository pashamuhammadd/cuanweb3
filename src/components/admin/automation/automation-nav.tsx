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
    <nav aria-label="Automation Center" className="mt-4 flex gap-2 overflow-x-auto border-b border-border-subtle pb-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
              active ? "bg-gold text-charcoal" : "text-offwhite/80 hover:bg-surface hover:text-gold",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
