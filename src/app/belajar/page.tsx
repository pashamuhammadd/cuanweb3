import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { listPublishedArticles } from "@/lib/data/articles";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Belajar",
  description: "Panduan praktis Web3 dan keamanan wallet untuk pemula.",
  alternates: { canonical: "/belajar" },
};

export default async function BelajarPage() {
  const { items, isDemoData } = await listPublishedArticles();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 shrink-0">
          <Image src="/assets/cua/welcome.png" alt="" fill sizes="56px" className="object-contain" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-offwhite">Belajar Web3</h1>
          <p className="text-sm text-muted-foreground">
            Panduan praktis sebelum mengikuti peluang Web3.
          </p>
        </div>
      </div>

      {isDemoData && (
        <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Menampilkan artikel contoh karena Supabase belum dikonfigurasi.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => (
          <Link
            key={article.id}
            href={`/belajar/${article.slug}`}
            className="group flex flex-col rounded-2xl border border-border-subtle bg-surface p-5 transition-all hover:-translate-y-1 hover:border-teal/60"
          >
            {article.isDemo && (
              <span className="mb-2 w-fit rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                Contoh
              </span>
            )}
            <h2 className="font-heading font-semibold text-offwhite group-hover:text-gold">
              {article.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{article.summary}</p>
            {article.publishedAt && (
              <p className="mt-3 text-xs text-muted-foreground">
                {formatDate(article.publishedAt)}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
