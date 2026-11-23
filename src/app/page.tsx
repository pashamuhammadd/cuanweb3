import type { Metadata } from "next";
import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { FeedSection } from "@/components/home/feed-section";
import { PlusPanel } from "@/components/home/plus-panel";
import { MissionGuideBanners } from "@/components/home/mission-guide-banners";
import { listOpportunities } from "@/lib/data/opportunities";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const { items } = await listOpportunities();

  return (
    <>
      <Hero />
      <CategoryGrid />
      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-6 px-4 md:grid-cols-[1fr_320px] md:px-6">
        <div className="min-w-0">
          <FeedSection items={items} />
        </div>
        <aside className="order-first min-w-0 pb-2 md:order-last md:py-8">
          <PlusPanel />
        </aside>
      </section>
      <MissionGuideBanners />
    </>
  );
}
