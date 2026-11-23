import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Gift, Clock, ShieldCheck, ExternalLink, ArrowLeft } from "lucide-react";
import { getOpportunityBySlug } from "@/lib/data/opportunities";
import { CATEGORIES } from "@/lib/nav";
import { formatDate, formatRelativeDeadline } from "@/lib/format";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getOpportunityBySlug(slug);
  if (!item) return {};

  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `/peluang/${item.slug}` },
    openGraph: {
      title: item.title,
      description: item.summary,
    },
  };
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const { item, isDemoData } = await getOpportunityBySlug(slug);

  if (!item) notFound();

  const category = CATEGORIES.find((c) => c.slug === item.category);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Link
        href={category ? `/${category.slug}` : "/peluang"}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke {category?.label ?? "Peluang"}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {item.isDemo && (
          <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Contoh — data simulasi
          </span>
        )}
        <span className="rounded-full bg-teal/15 px-2.5 py-1 text-xs font-medium text-teal">
          {category?.label ?? item.category}
        </span>
        {item.verifiedAt && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Diverifikasi {formatDate(item.verifiedAt)}
          </span>
        )}
      </div>

      <h1 className="font-heading mt-3 text-2xl font-bold text-offwhite md:text-3xl">
        {item.title}
      </h1>
      <p className="mt-2 text-base text-muted-foreground">{item.summary}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-border-subtle bg-surface p-5 sm:grid-cols-2">
        <div className="flex items-start gap-2">
          <Gift className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <div>
            <div className="text-xs text-muted-foreground">Reward</div>
            <div className="text-sm font-medium text-offwhite">
              {item.rewardDescription ?? "Belum diumumkan"}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <div>
            <div className="text-xs text-muted-foreground">Deadline</div>
            <div className="text-sm font-medium text-offwhite">
              {formatRelativeDeadline(item.deadlineAt)}
            </div>
          </div>
        </div>
      </div>

      {item.requirements.length > 0 && (
        <div className="mt-6">
          <h2 className="font-heading text-lg font-semibold text-offwhite">Syarat</h2>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {item.requirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="prose-invert mt-6 whitespace-pre-line text-sm leading-relaxed text-offwhite/90">
        {item.content}
      </div>

      {isDemoData && (
        <p className="mt-6 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Ini adalah data contoh untuk keperluan pengembangan — bukan peluang nyata.
          Jangan mengirimkan data pribadi atau wallet ke tautan simulasi.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {item.externalUrl ? (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.02] active:scale-95"
          >
            Buka sumber resmi
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border-subtle px-5 py-2.5 text-sm text-muted-foreground">
            Tautan resmi belum tersedia (data contoh)
          </span>
        )}
        <BookmarkButton opportunityId={item.id} />
      </div>
    </div>
  );
}
