import type { Metadata } from "next";
import { CategoryRow, categoryCount } from "@/components/home/category-grid";
import { listOpportunities } from "@/lib/data/opportunities";
import { CATEGORIES } from "@/lib/nav";
import { countByCategory } from "@/lib/opportunity-stats";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Semua kategori",
  description: "Jelajahi 10 kategori peluang Web3: airdrop, giveaway, bounty, kontes, jobs, hackathon, grants, testnet, ambassador, dan misi berbayar.",
  alternates: { canonical: "/kategori" },
};

export default async function KategoriPage() {
  const { items } = await listOpportunities();
  const counts = countByCategory(items);
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-6 md:py-10 lg:px-10">
      <h1 className="font-heading text-2xl font-bold text-offwhite md:text-3xl">Semua kategori</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pilih jenis peluang yang ingin kamu ikuti.</p>
      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
        {CATEGORIES.map((category, i) => (
          <li key={category.slug}>
            <CategoryRow category={category} count={categoryCount(category, counts)} index={i} />
          </li>
        ))}
      </ul>
    </div>
  );
}
