import type { Opportunity } from "@/types/opportunity";
import type { Category } from "@/lib/nav";
import { CategoryIcon } from "@/components/category/category-icon";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { SectionHeading } from "@/components/ui/section-heading";

export type Rail = { category: Category; items: Opportunity[]; total: number };

/** Satu section per kategori yang punya peluang aktif, dengan "Lihat semua" ke halaman kategori. */
export function CategoryRails({ rails }: { rails: Rail[] }) {
  if (rails.length === 0) return null;
  return (
    <div className="space-y-10">
      {rails.map(({ category, items, total }) => {
        const headingId = `rail-${category.slug}`;
        return (
          <section key={category.slug} aria-labelledby={headingId}>
            <SectionHeading
              id={headingId}
              title={
                <span className="inline-flex items-center gap-2.5">
                  <CategoryIcon category={category.slug} size="sm" />
                  {category.label}
                  <span className="font-mono text-base font-medium text-muted-foreground tabular-nums-fixed">{total}</span>
                </span>
              }
              href={category.href}
              srSuffix={category.label}
            />
            <ul className="mt-4 grid grid-cols-1 gap-3 md:mt-5 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {items.map((item) => (
                <li key={item.id}>
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
