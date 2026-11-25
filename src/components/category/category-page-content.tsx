import type { Category } from "@/lib/nav";
import { OpportunityFilterBar } from "@/components/opportunities/opportunity-filter-bar";
import { listOpportunitiesByCategory } from "@/lib/data/opportunities";
import { CategoryIcon } from "./category-icon";
import { CategoryChips } from "./category-chips";

export async function CategoryPageContent({ category }: { category: Category }) {
  const { items, isDemoData, hasError } = await listOpportunitiesByCategory(category.includes ?? category.slug);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-6 md:py-8 lg:px-10">
      <header className="flex items-center gap-4 md:gap-5">
        <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-elevated md:h-28 md:w-28"><CategoryIcon category={category.slug} size="xl" priority /></span>
        <div className="min-w-0">
          <h1 className="font-heading text-2xl font-bold text-offwhite md:text-3xl">{category.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">{category.description}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">
            <span className="font-mono text-champagne tabular-nums-fixed">{items.length}</span> peluang aktif
          </p>
        </div>
      </header>

      <CategoryChips current={category.slug} className="mt-5" />

      {isDemoData && (
        <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Data contoh (pengembangan): Supabase belum dikonfigurasi atau belum ada listing published.
        </p>
      )}
      {hasError && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          Daftar peluang sedang tidak dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
        </p>
      )}

      <div className="mt-5">
        <OpportunityFilterBar items={items} showCategoryFilter={Boolean(category.includes)} />
      </div>
    </div>
  );
}
