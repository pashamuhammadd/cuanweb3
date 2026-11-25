import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeedSection } from "@/components/home/feed-section";
import { PlusPanel } from "@/components/home/plus-panel";
import { MissionGuideBanners } from "@/components/home/mission-guide-banners";
import { listOpportunities } from "@/lib/data/opportunities";

// ISR: listing diperbarui otomatis tiap 5 menit (hasil cron Opportunity Engine).
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { items } = await listOpportunities();

  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeedSection items={items} />
      <aside className="mx-auto max-w-[1440px] px-4 pb-8 md:px-6">
        <PlusPanel />
      </aside>
      <MissionGuideBanners />
    </>
  );
}
