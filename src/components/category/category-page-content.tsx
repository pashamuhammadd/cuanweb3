import Image from "next/image";
import type { Category } from "@/lib/nav";
import { OpportunityFilterBar } from "@/components/opportunities/opportunity-filter-bar";
import { listOpportunitiesByCategory } from "@/lib/data/opportunities";

export async function CategoryPageContent({ category }: { category: Category }) {
  const { items, isDemoData, hasError } = await listOpportunitiesByCategory(category.includes ?? category.slug);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <div className="flex flex-col items-start gap-4 rounded-2xl border border-border-subtle bg-surface p-5 sm:flex-row sm:items-center">
        <div className="relative h-16 w-16 shrink-0">
          <Image src={category.image} alt="" fill sizes="64px" className="object-contain" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-offwhite">{category.label}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {isDemoData && (
        <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Menampilkan data contoh karena Supabase belum dikonfigurasi atau belum ada
          listing published. Lihat README untuk instruksi setup.
        </p>
      )}

      {hasError && (
        <p role="alert" className="mt-4 rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          Daftar peluang sedang tidak dapat dimuat. Coba muat ulang halaman beberapa saat lagi.
        </p>
      )}

      <div className="mt-6">
        <OpportunityFilterBar items={items} />
      </div>
    </div>
  );
}
