import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { getArticleBySlug } from "@/lib/data/articles";
import { formatDate } from "@/lib/format";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getArticleBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/belajar/${item.slug}` },
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { item } = await getArticleBySlug(slug);

  if (!item) notFound();

  return (
    <article className="mx-auto max-w-[68ch] px-4 py-5 md:px-6 md:py-10">
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1 text-sm text-muted-foreground">
          <li>
            <Link href="/belajar" className="inline-flex min-h-10 items-center hover:text-champagne">
              Belajar
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="truncate text-offwhite/80" aria-current="page">
            Panduan
          </li>
        </ol>
      </nav>

      {item.isDemo && (
        <span className="mt-3 inline-block rounded-md bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Contoh, artikel simulasi
        </span>
      )}

      <h1 className="font-heading mt-3 text-[28px] leading-tight font-bold text-offwhite md:text-4xl">{item.title}</h1>
      {item.summary && <p className="mt-3 text-lg leading-relaxed text-offwhite/80">{item.summary}</p>}
      {item.publishedAt && <p className="mt-3 text-sm text-muted-foreground">Diterbitkan {formatDate(item.publishedAt)}</p>}

      <div className="mt-8 border-t border-border-faint pt-8 text-base leading-[1.8] whitespace-pre-line text-offwhite/90 md:text-[17px]">
        {item.content}
      </div>

      <aside className="mt-10 flex items-start gap-3 rounded-2xl border border-border-subtle bg-elevated/60 p-4 text-sm text-offwhite/85">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-champagne" aria-hidden />
        <p>CuanWeb3 tidak pernah meminta seed phrase atau private key. Selalu cek ulang informasi di situs resmi.</p>
      </aside>
    </article>
  );
}
