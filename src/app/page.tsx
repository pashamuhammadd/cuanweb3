import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategoryGrid, categoryCount } from "@/components/home/category-grid";
import { FeedSection } from "@/components/home/feed-section";
import { CategoryRails, type Rail } from "@/components/home/category-rails";
import { PlusPanel } from "@/components/home/plus-panel";
import { MissionGuideBanners } from "@/components/home/mission-guide-banners";
import { listOpportunities } from "@/lib/data/opportunities";
import { listPublishedArticles } from "@/lib/data/articles";
import { CATEGORIES, HOME_CATEGORIES } from "@/lib/nav";
import { countByCategory } from "@/lib/opportunity-stats";

// ISR: listing diperbarui otomatis tiap 5 menit (hasil cron Opportunity Engine).
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const RAIL_ITEMS = 6;
const MAX_RAILS = 3;

export default async function HomePage() {
  const [{ items, isDemoData, hasError }, { items: articles }] = await Promise.all([listOpportunities(), listPublishedArticles()]);
  const counts = countByCategory(items);

  // Kategori tunggal (bukan gabungan) yang punya peluang, terbanyak dulu.
  const singleCategories = CATEGORIES.filter((c) => !c.includes);
  const ranked = singleCategories
    .map((c) => ({ category: c, total: categoryCount(c, counts) }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
  const rails: Rail[] = ranked.slice(0, MAX_RAILS).map(({ category, total }) => ({
    category,
    total,
    items: items.filter((i) => i.category === category.slug).slice(0, RAIL_ITEMS),
  }));
  const chips = (ranked.length >= 3 ? ranked : [...ranked, ...singleCategories.map((c) => ({ category: c, total: 0 }))])
    .filter((r, i, arr) => arr.findIndex((x) => x.category.slug === r.category.slug) === i)
    .slice(0, 3)
    .map((r) => ({ category: r.category.slug, count: r.total }));

  return (
    <>
      <Hero total={items.length} chips={chips} />
      <CategoryGrid categories={HOME_CATEGORIES} counts={counts} />

      <div className="mx-auto max-w-[1440px] px-4 md:px-6">
        {isDemoData && (
          <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
            Data contoh (pengembangan): Supabase belum dikonfigurasi.
          </p>
        )}
        {hasError && (
          <p role="alert" className="mt-4 rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            Daftar peluang sedang tidak dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 py-6 md:py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-10">
            <FeedSection items={items} />
            <CategoryRails rails={rails} />
          </div>
          <aside className="min-w-0 lg:sticky lg:top-[calc(var(--header-h)+1rem)] lg:self-start">
            <PlusPanel />
          </aside>
        </div>
      </div>

      <MissionGuideBanners articles={articles} />
    </>
  );
}
