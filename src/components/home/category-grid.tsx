import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/nav";
import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { CategoryIcon } from "@/components/category/category-icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

export function categoryCount(category: Category, counts: Partial<Record<OpportunityCategory, number>>) {
  return (category.includes ?? [category.slug]).reduce((n, c) => n + (counts[c] ?? 0), 0);
}

/** Kartu kategori beranda: mobile ikon di tengah + label ringkas; desktop ikon kiri atas + deskripsi. */
export function CategoryTile({ category, index = 0, priority }: { category: Category; index?: number; priority?: boolean }) {
  return (
    <Reveal delay={index * 50} className="h-full">
      <Link
        href={category.href}
        className="card-surface card-interactive press group flex h-full min-h-[84px] flex-col items-center justify-center gap-2 px-2 py-3 text-center md:items-start md:justify-start md:gap-3 md:p-5 md:text-left"
      >
        <CategoryIcon category={category.slug} size="md" priority={priority} />
        <span className="min-w-0">
          <span className="block text-[13px] leading-tight font-semibold text-offwhite group-hover:text-gold md:font-heading md:text-lg">
            {category.shortLabel}
          </span>
          <span className="mt-1 hidden text-sm leading-snug text-muted-foreground md:block">{category.tagline}</span>
        </span>
      </Link>
    </Reveal>
  );
}

/** Baris kategori untuk halaman /kategori: ikon kiri, label, jumlah, deskripsi. */
export function CategoryRow({ category, count, index = 0 }: { category: Category; count: number; index?: number }) {
  return (
    <Reveal delay={index * 40} className="h-full">
      <Link href={category.href} className="card-surface card-interactive press group flex h-full items-center gap-4 p-4">
        <CategoryIcon category={category.slug} size="lg" />
        <span className="min-w-0 flex-1">
          <span className="font-heading block font-semibold text-offwhite group-hover:text-gold md:text-lg">{category.label}</span>
          <span className="block font-mono text-xs text-champagne tabular-nums-fixed">{count} peluang aktif</span>
          <span className="mt-1 line-clamp-2 block text-sm text-muted-foreground">{category.description}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden />
      </Link>
    </Reveal>
  );
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="kategori-heading" className="mx-auto max-w-[1440px] px-4 pt-5 md:px-6 md:pt-10 lg:px-10">
      <SectionHeading id="kategori-heading" title="Kategori Peluang" href="/kategori" linkLabel="Lihat semua" srSuffix="kategori" />
      <ul className="mt-3 grid grid-cols-3 gap-2.5 md:mt-5 md:gap-4 lg:grid-cols-6">
        {categories.map((category, i) => (
          <li key={category.slug}>
            <CategoryTile category={category} index={i} priority={i < 6} />
          </li>
        ))}
      </ul>
    </section>
  );
}
