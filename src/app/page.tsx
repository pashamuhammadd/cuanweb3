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

const RAIL_ITEMS = 3;
const MAX_RAILS = 3;

export default async function HomePage() {
  const [{ items, isDemoData, hasError }, { items: articles }] = await Promise.all([listOpportunities(), listPublishedArticles()]);
  const counts = countByCategory(items);

  // Kategori tunggal yang punya peluang, terbanyak dulu.
  const rails: Rail[] = CATEGORIES.filter((c) => !c.includes)
    .map((c) => ({ category: c, total: categoryCount(c, counts) }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, MAX_RAILS)
    .map(({ category, total }) => ({
      category,
      total,
      items: items.filter((i) => i.category === category.slug).slice(0, RAIL_ITEMS),
    }));

  return (
    <>
      <Hero />
      <CategoryGrid categories={HOME_CATEGORIES} />

      <div className="mx-auto max-w-[1440px] space-y-10 px-4 py-8 md:space-y-14 md:px-6 md:py-12 lg:px-10">
        {isDemoData && (
          <p className="rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
            Data contoh (pengembangan): Supabase belum dikonfigurasi.
          </p>
        )}
        {hasError && (
          <p role="alert" className="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            Daftar peluang sedang tidak dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
          </p>
        )}

        <FeedSection items={items} />
        <CategoryRails rails={rails} />
        <PlusPanel />
      </div>

      <MissionGuideBanners articles={articles} />
    </>
  );
}
