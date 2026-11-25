import type { Metadata } from "next";
import { OpportunityFilterBar } from "@/components/opportunities/opportunity-filter-bar";
import { CategoryChips } from "@/components/category/category-chips";
import { listOpportunities } from "@/lib/data/opportunities";

// ISR: listing diperbarui otomatis tiap 5 menit (hasil cron Opportunity Engine).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Peluang",
  description: "Semua peluang Web3: airdrop, giveaway, bounty, jobs, hackathon, dan grants.",
  alternates: { canonical: "/peluang" },
};

export default async function PeluangPage() {
  const { items, isDemoData, hasError } = await listOpportunities();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-6 md:py-8">
      <h1 className="font-heading text-2xl font-bold text-offwhite md:text-3xl">Semua peluang</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        <span className="font-mono text-offwhite tabular-nums-fixed">{items.length}</span> peluang aktif dari seluruh kategori.
      </p>

      <CategoryChips className="mt-4" />

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
        <OpportunityFilterBar items={items} showCategoryFilter />
      </div>
    </div>
  );
}
