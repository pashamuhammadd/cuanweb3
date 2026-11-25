import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/nav";
import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { CategoryIcon } from "@/components/category/category-icon";
import { Reveal } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";

export function categoryCount(category: Category, counts: Partial<Record<OpportunityCategory, number>>) {
  return (category.includes ?? [category.slug]).reduce((n, c) => n + (counts[c] ?? 0), 0);
}

export function CategoryTile({
  category,
  count,
  index = 0,
  layout = "stack",
  priority,
}: {
  category: Category;
  count: number | null;
  index?: number;
  layout?: "stack" | "row";
  priority?: boolean;
}) {
  return (
    <Reveal delay={index * 50} className="h-full">
      <Link
        href={category.href}
        className={cn(
          "card-surface card-interactive press group flex h-full",
          layout === "stack"
            ? "flex-col items-center gap-2 px-2 py-3 text-center md:gap-3 md:px-3 md:py-5"
            : "items-center gap-3 p-3 md:p-4",
        )}
      >
        <CategoryIcon category={category.slug} size={layout === "stack" ? "md" : "lg"} priority={priority} />
        <span className={cn("min-w-0", layout === "row" && "flex-1")}>
          <span
            className={cn(
              "block font-semibold text-offwhite transition-colors group-hover:text-gold",
              layout === "stack" ? "text-[13px] leading-tight md:text-sm" : "text-sm md:text-base",
            )}
          >
            {category.label}
          </span>
          {count !== null && (
            <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground tabular-nums-fixed md:text-xs">
              {count} peluang
            </span>
          )}
          {layout === "row" && <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{category.description}</span>}
        </span>
        {layout === "row" && (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden />
        )}
      </Link>
    </Reveal>
  );
}

export function CategoryGrid({
  categories,
  counts,
}: {
  categories: Category[];
  counts: Partial<Record<OpportunityCategory, number>>;
}) {
  return (
    <section aria-labelledby="kategori-heading" className="mx-auto max-w-[1440px] px-4 pt-4 pb-2 md:px-6 md:pt-8">
      <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
        <h2 id="kategori-heading" className="font-heading text-lg font-bold text-offwhite md:text-xl">
          Kategori peluang
        </h2>
        <Link
          href="/kategori"
          className="inline-flex min-h-10 items-center gap-1 rounded-lg px-1 text-sm font-medium text-gold hover:underline underline-offset-4"
        >
          Lihat semua
          <span className="sr-only"> kategori</span>
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <ul className="grid grid-cols-3 gap-2.5 md:grid-cols-6 md:gap-4">
        {categories.map((category, i) => (
          <li key={category.slug}>
            <CategoryTile category={category} count={categoryCount(category, counts)} index={i} priority={i < 6} />
          </li>
        ))}
      </ul>
    </section>
  );
}
