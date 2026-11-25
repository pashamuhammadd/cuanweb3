import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Coins, MapPin, ShieldAlert, ShieldCheck, UserRound } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { getCategory } from "@/lib/nav";
import { getCategorySpec } from "@/lib/category-specs";
import { categoryThumbnail } from "@/lib/category-theme";
import { formatRelativeDeadline, isFutureDate, tidyDashes } from "@/lib/format";
import { CategoryIcon } from "@/components/category/category-icon";
import { CardBookmark } from "./card-bookmark";
import { cn } from "@/lib/cn";

function isEnded(o: Opportunity) {
  return o.state === "expired" || (o.deadlineAt != null && !isFutureDate(o.deadlineAt));
}

function Status({ o }: { o: Opportunity }) {
  if (isEnded(o)) return <span className="rounded-md bg-elevated px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Berakhir</span>;
  if (o.riskLevel === "medium" || o.riskLevel === "high")
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/12 px-1.5 py-0.5 text-[11px] font-medium text-amber-200">
        <ShieldAlert className="h-3 w-3" aria-hidden />
        Cek risiko
      </span>
    );
  if (o.verifiedAt)
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300">
        <ShieldCheck className="h-3 w-3" aria-hidden />
        Terverifikasi
      </span>
    );
  return null;
}

/**
 * Kartu peluang versi C. Mobile: horizontal (thumbnail kiri 88px).
 * md+: vertikal dengan thumbnail 16:9. Thumbnail = foto editorial DEKORATIF
 * (fallback per kategori) karena listing belum punya gambar resmi.
 * Seluruh kartu bisa diklik lewat stretched link; bookmark tetap tombol
 * terpisah (tanpa elemen interaktif bersarang).
 */
export function OpportunityCard({
  opportunity: o,
  className,
  headingLevel = "h3",
  priority,
}: {
  opportunity: Opportunity;
  className?: string;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const category = getCategory(o.category);
  const spec = getCategorySpec(o.category);
  const ended = isEnded(o);
  const Heading = headingLevel;
  const reward = tidyDashes(o.rewardDescription);
  const location = tidyDashes(o.country);
  const showLocation = o.category === "jobs" && !o.deadlineAt;

  return (
    <article
      className={cn(
        "card-surface card-interactive group relative flex h-full gap-3 overflow-hidden p-3 focus-within:border-gold/40 md:flex-col md:gap-0 md:p-0",
        ended && "opacity-80",
        className,
      )}
    >
      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-lg bg-elevated md:aspect-video md:h-auto md:w-full md:rounded-none">
        <Image
          src={categoryThumbnail(o.category)}
          alt=""
          fill
          priority={priority}
          sizes="(min-width: 1280px) 420px, (min-width: 768px) 45vw, 88px"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent" aria-hidden />
        {o.isDemo && (
          <span className="absolute top-1.5 left-1.5 rounded-md bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-charcoal md:top-3 md:left-3 md:text-[11px]">
            Contoh
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col md:p-4">
        <Heading className="font-heading pr-11 text-[15px] leading-snug font-semibold text-offwhite md:pr-0 md:text-[17px]">
          <Link
            href={`/peluang/${o.slug}`}
            className="line-clamp-2 outline-none after:absolute after:inset-0 after:rounded-[14px] after:content-[''] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold group-hover:text-gold"
          >
            {o.title}
          </Link>
        </Heading>

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CategoryIcon category={o.category} size="xs" />
            {category.label}
          </span>
          <Status o={o} />
        </div>

        <p className="mt-2.5 flex min-w-0 items-start gap-1.5 rounded-md bg-gold/[0.08] px-2.5 py-1.5 text-[13px] ring-1 ring-gold/15">
          <Coins className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          <span className="min-w-0">
            <span className="text-champagne">{spec.labels.reward}: </span>
            <span className={cn("font-mono font-semibold tabular-nums-fixed", reward ? "text-gold" : "font-sans font-medium text-offwhite/70")}>
              {reward ?? "Belum diketahui"}
            </span>
          </span>
        </p>

        <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 pt-2.5 text-xs text-muted-foreground md:mt-3 md:border-t md:border-border-faint md:pt-3">
          <div className="flex min-w-0 items-center gap-1.5">
            {showLocation ? <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /> : <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />}
            <dt className="shrink-0">{showLocation ? spec.labels.location : spec.labels.deadline}:</dt>
            <dd className="truncate text-offwhite/85">{showLocation ? (location ?? "Belum diketahui") : formatRelativeDeadline(o.deadlineAt)}</dd>
          </div>
          {o.organizer && (
            <div className="flex min-w-0 items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <dt className="sr-only">{spec.labels.organizer}</dt>
              <dd className="truncate text-offwhite/85">{o.organizer}</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="absolute top-2 right-2 md:top-3 md:right-3">
        <CardBookmark id={o.id} title={o.title} />
      </div>
    </article>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="card-surface flex h-full gap-3 overflow-hidden p-3 md:flex-col md:gap-0 md:p-0" aria-hidden>
      <div className="skeleton h-[88px] w-[88px] shrink-0 rounded-lg md:aspect-video md:h-auto md:w-full md:rounded-none" />
      <div className="flex-1 md:p-4">
        <div className="skeleton h-4 w-11/12 rounded" />
        <div className="skeleton mt-2 h-3 w-1/3 rounded" />
        <div className="skeleton mt-3 h-8 w-full rounded-md" />
        <div className="skeleton mt-3 h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
