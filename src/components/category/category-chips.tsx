import Link from "next/link";
import { CATEGORIES } from "@/lib/nav";
import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { CategoryIcon } from "./category-icon";
import { cn } from "@/lib/cn";

/** Navigasi cepat antar kategori (geser horizontal di mobile). */
export function CategoryChips({ current, className }: { current?: OpportunityCategory; className?: string }) {
  return (
    <nav aria-label="Kategori lain" className={className}>
      <ul className="no-scrollbar relative -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {CATEGORIES.map((c) => {
          const active = c.slug === current;
          return (
            <li key={c.slug} className="shrink-0">
              <Link
                href={c.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press inline-flex h-11 items-center gap-1.5 rounded-lg border pr-3.5 pl-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border-faint bg-surface text-offwhite/80 hover:border-gold/40 hover:text-offwhite",
                )}
              >
                <CategoryIcon category={c.slug} size="xs" />
                {c.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
