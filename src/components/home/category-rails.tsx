import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { Category } from "@/lib/nav";
import { CategoryIcon } from "@/components/category/category-icon";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";

export type Rail = { category: Category; items: Opportunity[]; total: number };

/**
 * Satu baris per kategori yang punya peluang aktif. Mobile: geser horizontal
 * (scroll-snap) seperti aplikasi; desktop: grid 3–4 kolom. Selalu ada
 * "Lihat semua" ke halaman kategori.
 */
export function CategoryRails({ rails }: { rails: Rail[] }) {
  if (rails.length === 0) return null;
  return (
    <div className="space-y-8">
      {rails.map(({ category, items, total }) => {
        const headingId = `rail-${category.slug}`;
        return (
          <section key={category.slug} aria-labelledby={headingId}>
            <div className="flex items-center justify-between gap-3">
              <h2 id={headingId} className="flex items-center gap-2.5 font-heading text-lg font-bold text-offwhite md:text-xl">
                <CategoryIcon category={category.slug} size="sm" />
                {category.label}
                <span className="font-mono text-sm font-medium text-muted-foreground tabular-nums-fixed">{total}</span>
              </h2>
              <Link
                href={category.href}
                className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-lg px-1 text-sm font-medium text-gold underline-offset-4 hover:underline"
              >
                Lihat semua
                <span className="sr-only"> {category.label}</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <ul className="no-scrollbar relative -mx-4 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-4 px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-3">
              {items.map((item) => (
                <li key={item.id} className="w-[82%] max-w-[340px] shrink-0 snap-start md:w-auto md:max-w-none">
                  <OpportunityCard opportunity={item} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
