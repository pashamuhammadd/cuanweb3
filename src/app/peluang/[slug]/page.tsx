import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Gift,
  Clock,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Building2,
  Layers,
  Wallet,
  MapPin,
  CalendarClock,
  AlertTriangle,
  Info,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import { getOpportunityBySlug, listOpportunitiesByCategory, EXPIRED_INDEX_DAYS } from "@/lib/data/opportunities";
import { getCategory } from "@/lib/nav";
import { REWARD_CERTAINTY_LABELS, ecosystemLabel } from "@/lib/categories";
import { detailValueLabel, getCategorySpec } from "@/lib/category-specs";
import { CATEGORY_THEME } from "@/lib/category-theme";
import { RISK_FLAG_LABELS } from "@/lib/engine/risk";
import { safeParseUrl } from "@/lib/engine/url";
import { formatDate, formatRelativeDeadline, isFutureDate } from "@/lib/format";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { CategoryIcon } from "@/components/category/category-icon";
import type { Opportunity } from "@/types/opportunity";

type Params = { slug: string };

/** Sumber yang mensyaratkan link-back "follow" (tanpa nofollow). */
const FOLLOW_LINK_SOURCES = new Set(["web3_career"]);

/** "15 Desember 2026 · 5 hari lagi": label relatif hanya bila bukan sekadar tanggal. */
function deadlineText(iso: string): string {
  const relative = formatRelativeDeadline(iso);
  return /hari|berakhir/i.test(relative) ? `${formatDate(iso)} · ${relative}` : formatDate(iso);
}

function isEnded(item: Opportunity): boolean {
  return item.state === "expired" || (item.deadlineAt != null && !isFutureDate(item.deadlineAt));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { item } = await getOpportunityBySlug(slug);
  if (!item) return {};

  const endedAt = item.expiredAt ?? item.deadlineAt;
  const longExpired =
    isEnded(item) && endedAt != null && Date.now() - Date.parse(endedAt) > EXPIRED_INDEX_DAYS * 86_400_000;
  const title = isEnded(item) ? `${item.title} (Berakhir)` : item.title;

  return {
    title,
    description: item.summary,
    alternates: { canonical: `/peluang/${item.slug}` },
    // Halaman berakhir tetap bisa dibuka (bookmark/link lama) tetapi tidak
    // diindeks lagi setelah masa tenggang, agar hasil pencarian tetap relevan.
    robots: longExpired ? { index: false, follow: true } : undefined,
    openGraph: { title, description: item.summary },
  };
}

function Fact({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
      <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-raised" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="text-sm font-medium break-words text-offwhite">{children}</dd>
      </div>
    </div>
  );
}

export default async function OpportunityDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { item, isDemoData } = await getOpportunityBySlug(slug);

  if (!item) notFound();

  const category = getCategory(item.category);
  const spec = getCategorySpec(item.category);
  const details = item.details ?? {};
  const detailFacts = spec.details.filter((f) => details[f.key]);
  const ended = isEnded(item);
  // Data lama bisa berisi URL tanpa skema (mis. "www.contoh.com"): jangan pernah
  // membuat halaman gagal render, dan hanya tautkan URL http(s) yang valid.
  const sourceHref = safeParseUrl(item.sourceUrl)?.toString() ?? null;
  const externalHref = safeParseUrl(item.externalUrl)?.toString() ?? null;
  const certainty = item.rewardCertainty ?? "unknown";
  const riskFlags = (item.riskFlags ?? []).filter((f) => RISK_FLAG_LABELS[f]);
  const followLink = item.sourceProvider ? FOLLOW_LINK_SOURCES.has(item.sourceProvider) : false;
  const iconClass = "h-4 w-4 text-muted-foreground";

  const { items: sameCategory } = await listOpportunitiesByCategory(item.category);
  const related = sameCategory.filter((o) => o.id !== item.id).slice(0, 3);

  const summaryCard = (
    <section aria-label="Ringkasan informasi" className="card-surface p-4 md:p-5">
      <div className="rounded-xl bg-section p-3.5 ring-1 ring-border-faint">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Gift className="h-3.5 w-3.5 text-gold" aria-hidden />
          {spec.labels.reward}
        </p>
        <p
          className={
            item.rewardDescription
              ? "mt-1 font-mono text-lg font-semibold break-words text-gold tabular-nums-fixed"
              : "mt-1 text-base font-medium text-offwhite/70"
          }
        >
          {item.rewardDescription ?? "Belum diketahui"}
        </p>
        {item.category !== "jobs" && <p className="mt-0.5 text-xs text-muted-foreground">{REWARD_CERTAINTY_LABELS[certainty]}</p>}
      </div>

      <dl className="mt-3 divide-y divide-border-faint">
        <Fact icon={<Clock className={iconClass} />} label={spec.labels.deadline}>
          {item.deadlineAt ? deadlineText(item.deadlineAt) : "Belum diketahui"}
        </Fact>
        {item.organizer !== undefined && (
          <Fact icon={<Building2 className={iconClass} />} label={spec.labels.organizer}>
            {item.organizer ?? "Belum diketahui"}
          </Fact>
        )}
        {(item.country || item.category === "jobs") && (
          <Fact icon={<MapPin className={iconClass} />} label={spec.labels.location}>
            {item.country ?? "Belum diketahui"}
          </Fact>
        )}
        {detailFacts.map((field) => (
          <Fact key={field.key} icon={<ListChecks className={iconClass} />} label={field.label}>
            {detailValueLabel(item.category, field.key, details[field.key]!)}
          </Fact>
        ))}
        {item.startsAt && (
          <Fact icon={<CalendarClock className={iconClass} />} label={spec.labels.startsAt}>
            {formatDate(item.startsAt)}
          </Fact>
        )}
        {item.ecosystems !== undefined && (
          <Fact icon={<Layers className={iconClass} />} label="Ekosistem">
            {item.ecosystems.length ? item.ecosystems.map(ecosystemLabel).join(", ") : "Belum diketahui"}
          </Fact>
        )}
        {item.category !== "jobs" && (
          <Fact icon={<Wallet className={iconClass} />} label="Modal / biaya">
            {item.costInfo ?? (item.isFree ? "Gratis" : "Belum diketahui")}
          </Fact>
        )}
      </dl>

      <div className="mt-4 flex flex-col gap-2">
        {externalHref ? (
          <a
            href={externalHref}
            target="_blank"
            rel={followLink ? "noopener" : "noopener noreferrer nofollow"}
            className="press glow-gold inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-charcoal transition-[filter] hover:brightness-105"
          >
            {ended ? "Lihat halaman resmi" : spec.labels.cta}
            <ExternalLink className="h-4 w-4" aria-hidden />
            <span className="sr-only">(membuka tab baru)</span>
          </a>
        ) : (
          <span className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-dashed border-border-subtle px-5 text-sm text-muted-foreground">
            Tautan resmi belum tersedia
          </span>
        )}
        {!ended && (
          <div className="flex [&>*]:h-11 [&>*]:flex-1 [&>*]:justify-center [&>*]:rounded-xl">
            <BookmarkButton opportunityId={item.id} redirectTo={`/peluang/${item.slug}`} />
          </div>
        )}
      </div>

      {(item.verifiedAt || item.lastCheckedAt) && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {item.verifiedAt ? `Link resmi diverifikasi ${formatDate(item.verifiedAt)}` : `Terakhir dicek ${formatDate(item.lastCheckedAt!)}`}
        </p>
      )}
    </section>
  );

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-4 md:px-6 md:py-8">
      <nav aria-label="Breadcrumb">
        <ol className="flex min-w-0 items-center gap-1 text-sm text-muted-foreground">
          <li className="shrink-0">
            <Link href="/" className="inline-flex min-h-10 items-center hover:text-teal">
              Beranda
            </Link>
          </li>
          <li aria-hidden className="shrink-0">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="shrink-0">
            <Link href={category.href} className="inline-flex min-h-10 items-center whitespace-nowrap hover:text-teal">
              {category.label}
            </Link>
          </li>
          <li aria-hidden className="hidden shrink-0 sm:block">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li className="hidden min-w-0 truncate text-offwhite/80 sm:block" aria-current="page">
            {item.title}
          </li>
        </ol>
      </nav>

      {ended && (
        <div role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm text-offwhite">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <p>
            <strong>Peluang ini sudah berakhir.</strong> Halaman disimpan sebagai arsip informasi. Cari peluang aktif lain di{" "}
            <Link href={category.href} className="font-semibold text-gold underline-offset-4 hover:underline">
              {category.label}
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0">
          <header>
            <div className="flex items-center gap-3">
              <CategoryIcon category={item.category} size="lg" priority />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-semibold" style={{ color: CATEGORY_THEME[item.category].fg }}>
                  {category.label}
                </span>
                {item.isDemo && (
                  <span className="rounded-md bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Contoh, data simulasi
                  </span>
                )}
                {ended && <span className="rounded-md bg-surface-raised px-2 py-0.5 text-xs font-medium text-muted-foreground">Berakhir</span>}
                {item.verifiedAt && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                    Terverifikasi
                  </span>
                )}
              </div>
            </div>
            <h1 className="font-heading mt-4 text-2xl leading-tight font-bold text-offwhite md:text-[32px]">{item.title}</h1>
            {item.organizer && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-offwhite/80">
                <Building2 className="h-4 w-4 text-muted-foreground" aria-hidden />
                <span className="sr-only">{spec.labels.organizer}: </span>
                {item.organizer}
              </p>
            )}
          </header>

          {/* Mobile: ringkasan + CTA sebelum deskripsi panjang */}
          <div className="mt-5 lg:hidden">{summaryCard}</div>

          {riskFlags.length > 0 && (
            <div role="note" className="mt-5 flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-100">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden />
              <div>
                <p className="font-semibold">Perhatikan sebelum ikut:</p>
                <ul className="mt-1 list-inside list-disc">
                  {riskFlags.map((f) => (
                    <li key={f}>{RISK_FLAG_LABELS[f]}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <section aria-labelledby="tentang-heading" className="mt-6">
            <h2 id="tentang-heading" className="font-heading text-lg font-semibold text-offwhite">
              Tentang peluang ini
            </h2>
            <p className="mt-2 text-base leading-relaxed text-offwhite/85">{item.summary}</p>
          </section>

          {item.requirements.length > 0 && (
            <section aria-labelledby="syarat-heading" className="mt-6">
              <h2 id="syarat-heading" className="font-heading text-lg font-semibold text-offwhite">
                {spec.labels.requirements}
              </h2>
              <ul className="mt-2 space-y-1.5 text-sm text-offwhite/85">
                {item.requirements.map((req) => (
                  <li key={req} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" aria-hidden />
                    {req}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {item.content && (
            <section aria-labelledby="panduan-heading" className="mt-6">
              <h2 id="panduan-heading" className="font-heading text-lg font-semibold text-offwhite">
                Panduan mengikuti
              </h2>
              <div className="card-surface mt-2 p-4 text-sm leading-relaxed whitespace-pre-line text-offwhite/85 md:p-5">{item.content}</div>
            </section>
          )}

          {(item.sourceName || sourceHref) && (
            <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
              Sumber:{" "}
              {sourceHref ? (
                <a
                  href={sourceHref}
                  target="_blank"
                  rel={followLink ? "noopener" : "noopener noreferrer nofollow"}
                  className="text-teal underline-offset-4 hover:underline"
                >
                  {item.sourceName ?? new URL(sourceHref).hostname}
                </a>
              ) : (
                item.sourceName
              )}
              {item.lastCheckedAt && <> · terakhir dicek {formatDate(item.lastCheckedAt)}</>}. Informasi dapat berubah; ikuti
              ketentuan resmi penyelenggara.
            </p>
          )}

          {isDemoData && (
            <p className="mt-6 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
              Ini adalah data contoh untuk keperluan pengembangan, bukan peluang nyata. Jangan mengirimkan data pribadi atau
              wallet ke tautan simulasi.
            </p>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+1rem)]">{summaryCard}</div>
        </aside>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="terkait-heading" className="mt-10 border-t border-border-faint pt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 id="terkait-heading" className="font-heading text-lg font-bold text-offwhite md:text-xl">
              Peluang {category.label} lainnya
            </h2>
            <Link href={category.href} className="inline-flex min-h-10 shrink-0 items-center text-sm font-medium text-gold underline-offset-4 hover:underline">
              Lihat semua
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
            {related.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
