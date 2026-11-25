import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { listPublishedArticles } from "@/lib/data/articles";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Belajar",
  description: "Panduan praktis Web3 dan keamanan wallet untuk pemula.",
  alternates: { canonical: "/belajar" },
};

export default async function BelajarPage() {
  const { items, isDemoData } = await listPublishedArticles();
  const [featured, ...rest] = items;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5 md:px-6 md:py-8">
      <PageHeader
        visual={<span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-elevated text-gold md:h-16 md:w-16"><BookOpen className="h-7 w-7" aria-hidden /></span>}
        title="Belajar Web3"
        description="Panduan praktis sebelum mengikuti peluang Web3."
      />

      {isDemoData && (
        <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Menampilkan artikel contoh karena Supabase belum dikonfigurasi.
        </p>
      )}

      {items.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
          Belum ada panduan yang diterbitkan.
        </p>
      )}

      {featured && (
        <Link
          href={`/belajar/${featured.slug}`}
          className="card-interactive press group mt-6 block overflow-hidden rounded-2xl border border-gold/20 bg-[radial-gradient(80%_140%_at_100%_0%,rgba(244,189,53,0.16),transparent_60%),linear-gradient(180deg,#1b1f27,#171a21)] p-5 md:p-7"
        >
          <p className="inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
            <BookOpen className="h-3.5 w-3.5" aria-hidden />
            Panduan terbaru
          </p>
          <h2 className="font-heading mt-3 max-w-2xl text-xl font-bold text-offwhite group-hover:text-gold md:text-2xl">{featured.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-offwhite/80 md:text-base">{featured.summary}</p>
          <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-gold">
            Baca panduan
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </p>
        </Link>
      )}

      {rest.length > 0 && (
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
          {rest.map((article) => (
            <li key={article.id}>
              <Link href={`/belajar/${article.slug}`} className="card-surface card-interactive press group flex h-full flex-col p-4 md:p-5">
                {article.isDemo && (
                  <span className="mb-2 w-fit rounded-md bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-muted-foreground">Contoh</span>
                )}
                <h2 className="font-heading font-semibold text-offwhite group-hover:text-gold">{article.title}</h2>
                <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{article.summary}</p>
                {article.publishedAt && <p className="mt-auto pt-3 text-xs text-muted-foreground">{formatDate(article.publishedAt)}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
