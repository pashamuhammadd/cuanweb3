import type { Metadata } from "next";
import { OpportunityFilterBar } from "@/components/opportunities/opportunity-filter-bar";
import { listOpportunities } from "@/lib/data/opportunities";

// ISR: listing diperbarui otomatis tiap 5 menit (hasil cron Opportunity Engine).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Peluang",
  description: "Semua peluang Web3: airdrop, giveaway, bounty, jobs, hackathon, dan grants.",
  alternates: { canonical: "/peluang" },
};

export default async function PeluangPage() {
  const { items, isDemoData } = await listOpportunities();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <h1 className="font-heading text-2xl font-bold text-offwhite md:text-3xl">
        Semua peluang
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {items.length} peluang aktif dari seluruh kategori.
      </p>

      {isDemoData && (
        <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Menampilkan data contoh karena Supabase belum dikonfigurasi atau belum ada
          listing published.
        </p>
      )}

      <div className="mt-6">
        <OpportunityFilterBar items={items} />
      </div>
    </div>
  );
}
