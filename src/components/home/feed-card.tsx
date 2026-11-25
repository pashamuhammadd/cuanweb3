import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight, Clock, Gift, MapPin } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { getCategory } from "@/lib/nav";
import { detailValueLabel, getCategorySpec } from "@/lib/category-specs";
import { formatRelativeDeadline } from "@/lib/format";

const pad = (n: number) => String(n).padStart(2, "0");

/** Kartu peluang terbaru di beranda: bingkai cahaya emas, ikon kategori, dan info inti. */
export function FeedCard({
  opportunity,
  index,
  total,
}: {
  opportunity: Opportunity;
  index: number;
  total: number;
}) {
  const category = getCategory(opportunity.category);
  const Icon = category.icon;
  const spec = getCategorySpec(opportunity.category);
  const details = opportunity.details ?? {};
  const jobTraits =
    opportunity.category === "jobs"
      ? [
          details.employment_type && detailValueLabel("jobs", "employment_type", details.employment_type),
          details.work_mode && detailValueLabel("jobs", "work_mode", details.work_mode),
          opportunity.country,
        ].filter(Boolean)
      : [];
  const style = {
    "--glow-delay": `${-0.9 * index}s`,
    "--glow-speed": `${7 + (index % 3)}s`,
  } as CSSProperties;

  return (
    <li className="glow-frame" style={style}>
      <Link
        href={`/peluang/${opportunity.slug}`}
        className="group relative z-0 m-px flex h-[calc(100%-2px)] flex-col overflow-hidden rounded-[13px] bg-surface p-4 transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        {/* Sapuan cahaya halus di pojok kanan atas. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[radial-gradient(closest-side,rgba(244,189,53,0.14),transparent)] transition-opacity duration-500 group-hover:opacity-100 md:opacity-60"
        />

        <div className="relative flex items-start justify-between gap-3">
          <span
            aria-hidden="true"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-[#0f161c] transition-colors group-hover:border-gold"
          >
            <Icon className="h-[18px] w-[18px] text-gold" strokeWidth={1.7} />
          </span>
          <span className="flex items-center gap-1.5">
            {opportunity.isDemo && (
              <span className="rounded-full bg-surface-raised px-2 py-0.5 font-mono text-[0.6rem] text-muted-foreground">
                Contoh
              </span>
            )}
            <span aria-hidden="true" className="font-mono text-[0.65rem] text-gold/70">
              {pad(index + 1)} / {pad(total)}
            </span>
          </span>
        </div>

        <p className="relative mt-3 truncate font-mono text-[0.68rem] text-[#3fc1b4]">
          {category.label}
          {opportunity.organizer ? ` · ${opportunity.organizer}` : ""}
        </p>
        <h3 className="relative mt-1 line-clamp-2 font-heading text-base font-bold leading-snug tracking-tight text-offwhite transition-colors group-hover:text-gold">
          {opportunity.title}
        </h3>

        <div className="relative mt-3 space-y-1.5 font-mono text-[0.7rem] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="sr-only">{spec.labels.reward}: </span>
            <Gift className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
            <span className="truncate text-offwhite/90">
              {opportunity.rewardDescription ?? "Belum diketahui"}
            </span>
          </div>
          {jobTraits.length > 0 && !opportunity.deadlineAt ? (
            <div className="flex items-center gap-1.5">
              <span className="sr-only">Detail pekerjaan: </span>
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{jobTraits.join(" · ")}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="sr-only">{spec.labels.deadline}: </span>
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="truncate">{formatRelativeDeadline(opportunity.deadlineAt)}</span>
            </div>
          )}
        </div>

        <span className="relative mt-auto flex items-center justify-between gap-2 pt-4 font-mono text-[0.7rem] text-muted-foreground">
          <span>Lihat detail</span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-strong text-gold transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-charcoal">
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </span>
      </Link>
    </li>
  );
}
