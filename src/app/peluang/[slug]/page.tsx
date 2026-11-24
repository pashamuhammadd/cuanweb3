import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  Gift,
  Clock,
  ShieldCheck,
  ExternalLink,
  ArrowLeft,
  Building2,
  Layers,
  Wallet,
  MapPin,
  CalendarClock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { getOpportunityBySlug, EXPIRED_INDEX_DAYS } from "@/lib/data/opportunities";
import { getCategory } from "@/lib/nav";
import { REWARD_CERTAINTY_LABELS, ecosystemLabel } from "@/lib/categories";
import { RISK_FLAG_LABELS } from "@/lib/engine/risk";
import { formatDate, formatRelativeDeadline } from "@/lib/format";
import { BookmarkButton } from "@/components/opportunities/bookmark-button";
import type { Opportunity } from "@/types/opportunity";

type Params = { slug: string };

/** Sumber yang mensyaratkan link-back "follow" (tanpa nofollow). */
const FOLLOW_LINK_SOURCES = new Set(["web3_career"]);

/** "15 Desember 2026 · 5 hari lagi" — label relatif hanya bila bukan sekadar tanggal. */
function deadlineText(iso: string): string {
  const relative = formatRelativeDeadline(iso);
  return /hari|berakhir/i.test(relative) ? `${formatDate(iso)} · ${relative}` : formatDate(iso);
}

function isEnded(item: Opportunity): boolean {
  return item.state === "expired" || (item.deadlineAt != null && Date.parse(item.deadlineAt) < Date.now());
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
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium break-words text-offwhite">{children}</div>
      </div>
    </div>
  );
}

export default async function OpportunityDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { item, isDemoData } = await getOpportunityBySlug(slug);

  if (!item) notFound();

  const category = getCategory(item.category);
  const ended = isEnded(item);
  const certainty = item.rewardCertainty ?? "unknown";
  const riskFlags = (item.riskFlags ?? []).filter((f) => RISK_FLAG_LABELS[f]);
  const followLink = item.sourceProvider ? FOLLOW_LINK_SOURCES.has(item.sourceProvider) : false;
  const iconClass = "h-4 w-4";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Link
        href={category.href}
        className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-teal"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke {category.label}
      </Link>

      {ended && (
        <div role="status" className="mt-3 flex items-start gap-2 rounded-xl border border-gold/40 bg-gold/10 p-3 text-sm text-offwhite">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
          <p>
            <strong>Peluang ini sudah berakhir.</strong> Halaman disimpan sebagai arsip informasi. Cari peluang
            aktif lain di{" "}
            <Link href={category.href} className="font-semibold text-gold underline-offset-4 hover:underline">
              {category.label}
            </Link>
            .
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {item.isDemo && (
          <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Contoh — data simulasi
          </span>
        )}
        <span className="rounded-full bg-teal/15 px-2.5 py-1 text-xs font-medium text-teal">
          {category.label}
        </span>
        {ended && (
          <span className="rounded-full bg-surface-raised px-2.5 py-1 text-xs font-medium text-muted-foreground">
            Berakhir
          </span>
        )}
        {item.verifiedAt && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Diverifikasi {formatDate(item.verifiedAt)}
          </span>
        )}
      </div>

      <h1 className="font-heading mt-3 text-2xl font-bold text-offwhite md:text-3xl">{item.title}</h1>
      <p className="mt-2 text-base text-muted-foreground">{item.summary}</p>

      {riskFlags.length > 0 && (
        <div role="note" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/40 bg-rose-400/10 p-3 text-sm text-rose-100">
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

      <dl className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border-subtle bg-surface p-5 sm:grid-cols-2">
        <Fact icon={<Gift className={`${iconClass} text-gold`} />} label={item.category === "jobs" ? "Kompensasi" : "Reward"}>
          {item.rewardDescription ?? "Belum diketahui"}
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
            {REWARD_CERTAINTY_LABELS[certainty]}
          </span>
        </Fact>
        <Fact icon={<Clock className={`${iconClass} text-muted-foreground`} />} label="Deadline">
          {item.deadlineAt ? deadlineText(item.deadlineAt) : "Belum diketahui"}
        </Fact>
        {item.organizer !== undefined && (
          <Fact icon={<Building2 className={`${iconClass} text-muted-foreground`} />} label="Penyelenggara">
            {item.organizer ?? "Belum diketahui"}
          </Fact>
        )}
        {item.ecosystems !== undefined && (
          <Fact icon={<Layers className={`${iconClass} text-muted-foreground`} />} label="Ekosistem">
            {item.ecosystems.length ? item.ecosystems.map(ecosystemLabel).join(", ") : "Belum diketahui"}
          </Fact>
        )}
        {item.startsAt && (
          <Fact icon={<CalendarClock className={`${iconClass} text-muted-foreground`} />} label="Mulai">
            {formatDate(item.startsAt)}
          </Fact>
        )}
        <Fact icon={<Wallet className={`${iconClass} text-muted-foreground`} />} label="Modal / biaya">
          {item.costInfo ?? (item.isFree ? "Gratis" : "Belum diketahui")}
        </Fact>
        {item.country && (
          <Fact icon={<MapPin className={`${iconClass} text-muted-foreground`} />} label="Lokasi / cakupan">
            {item.country}
          </Fact>
        )}
      </dl>

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

      <div className="prose-invert mt-6 whitespace-pre-line text-sm leading-relaxed text-offwhite/90">{item.content}</div>

      {(item.sourceName || item.sourceUrl) && (
        <p className="mt-6 text-xs text-muted-foreground">
          Sumber:{" "}
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel={followLink ? "noopener" : "noopener noreferrer nofollow"}
              className="text-teal underline-offset-4 hover:underline"
            >
              {item.sourceName ?? new URL(item.sourceUrl).hostname}
            </a>
          ) : (
            item.sourceName
          )}
          {item.lastCheckedAt && <> · terakhir dicek {formatDate(item.lastCheckedAt)}</>}
          . Informasi dapat berubah; ikuti ketentuan resmi penyelenggara.
        </p>
      )}

      {isDemoData && (
        <p className="mt-6 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Ini adalah data contoh untuk keperluan pengembangan — bukan peluang nyata. Jangan mengirimkan data
          pribadi atau wallet ke tautan simulasi.
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        {item.externalUrl ? (
          <a
            href={item.externalUrl}
            target="_blank"
            rel={followLink ? "noopener" : "noopener noreferrer nofollow"}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.02] active:scale-95 motion-reduce:transition-none"
          >
            {ended ? "Lihat halaman resmi" : item.category === "jobs" ? "Lamar di situs resmi" : "Buka sumber resmi"}
            <ExternalLink className="h-4 w-4" aria-hidden />
            <span className="sr-only">(membuka tab baru)</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border-subtle px-5 py-2.5 text-sm text-muted-foreground">
            Tautan resmi belum tersedia
          </span>
        )}
        {!ended && <BookmarkButton opportunityId={item.id} />}
      </div>
    </div>
  );
}
