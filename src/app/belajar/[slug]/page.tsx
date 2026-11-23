import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getArticleBySlug } from "@/lib/data/articles";
import { formatDate } from "@/lib/format";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getArticleBySlug(slug);
  if (!item) return {};
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/belajar/${item.slug}` },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { item } = await getArticleBySlug(slug);

  if (!item) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <Link
        href="/belajar"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke Belajar
      </Link>

      {item.isDemo && (
        <span className="mt-4 inline-block rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted-foreground">
          Contoh — artikel simulasi
        </span>
      )}

      <h1 className="font-heading mt-3 text-2xl font-bold text-offwhite md:text-3xl">
        {item.title}
      </h1>
      {item.publishedAt && (
        <p className="mt-1 text-sm text-muted-foreground">{formatDate(item.publishedAt)}</p>
      )}

      <div className="prose-invert mt-6 whitespace-pre-line text-sm leading-relaxed text-offwhite/90">
        {item.content}
      </div>
    </div>
  );
}
