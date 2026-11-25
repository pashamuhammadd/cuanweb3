import Link from "next/link";
import { ArrowUpRight, Building2, CalendarClock, MapPin, ShieldAlert, ShieldCheck } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { getCategory } from "@/lib/nav";
import { ecosystemLabel } from "@/lib/categories";
import { detailValueLabel, getCategorySpec } from "@/lib/category-specs";
import { CATEGORY_THEME } from "@/lib/category-theme";
import { formatRelativeDeadline, isFutureDate } from "@/lib/format";
import { CategoryIcon } from "@/components/category/category-icon";
import { CardBookmark } from "./card-bookmark";
import { cn } from "@/lib/cn";

function isEnded(o: Opportunity) {
  return o.state === "expired" || (o.deadlineAt != null && !isFutureDate(o.deadlineAt));
}

function Badge({ tone, children }: { tone: "ok" | "warn" | "muted"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        tone === "ok" && "bg-emerald-500/10 text-emerald-300",
        tone === "warn" && "bg-amber-500/12 text-amber-200",
        tone === "muted" && "bg-surface-raised text-muted-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function OpportunityCard({
  opportunity: o,
  className,
  headingLevel = "h3",
}: {
  opportunity: Opportunity;
  className?: string;
  headingLevel?: "h2" | "h3";
}) {
  const category = getCategory(o.category);
  const spec = getCategorySpec(o.category);
  const details = o.details ?? {};
  const ended = isEnded(o);
  const risky = o.riskLevel === "medium" || o.riskLevel === "high";
  const Heading = headingLevel;
  const reward = o.rewardDescription;

  const jobTraits =
    o.category === "jobs"
      ? [
          details.employment_type && detailValueLabel("jobs", "employment_type", details.employment_type),
          details.work_mode && detailValueLabel("jobs", "work_mode", details.work_mode),
        ].filter((v): v is string => Boolean(v))
      : [];
  const ecosystems = o.ecosystems ?? [];

  return (
    <article
      className={cn(
        "card-surface card-interactive group relative flex h-full flex-col p-4 focus-within:border-border-strong",
        ended && "opacity-80",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <CategoryIcon category={o.category} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold" style={{ color: CATEGORY_THEME[o.category].fg }}>
              {category.label}
            </p>
            {ecosystems.length > 0 && (
              <p className="truncate text-[11px] text-muted-foreground">{ecosystems.slice(0, 2).map(ecosystemLabel).join(" · ")}</p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {o.isDemo && <Badge tone="muted">Contoh</Badge>}
          {ended ? (
            <Badge tone="muted">Berakhir</Badge>
          ) : risky ? (
            <Badge tone="warn">
              <ShieldAlert className="h-3 w-3" aria-hidden />
              Cek risiko
            </Badge>
          ) : o.verifiedAt ? (
            <Badge tone="ok">
              <ShieldCheck className="h-3 w-3" aria-hidden />
              Terverifikasi
            </Badge>
          ) : null}
        </div>
      </div>

      <Heading className="font-heading mt-3 line-clamp-2 text-[15px] leading-snug font-semibold text-offwhite md:text-base">
        <Link
          href={`/peluang/${o.slug}`}
          className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-[14px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-gold group-hover:text-gold"
        >
          {o.title}
        </Link>
      </Heading>

      {o.organizer && (
        <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="sr-only">{spec.labels.organizer}: </span>
          <span className="truncate">{o.organizer}</span>
        </p>
      )}

      <dl className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-section/80 p-3 ring-1 ring-border-faint">
        <div className="min-w-0">
          <dt className="text-[11px] text-muted-foreground">{spec.labels.reward}</dt>
          <dd
            className={cn(
              "line-clamp-2 font-mono text-[13px] leading-snug font-semibold break-words tabular-nums-fixed",
              reward ? "text-gold" : "font-sans font-medium text-offwhite/60",
            )}
            title={reward ?? undefined}
          >
            {reward ?? "Belum diketahui"}
          </dd>
        </div>
        {o.category === "jobs" && !o.deadlineAt ? (
          <div className="min-w-0">
            <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <MapPin className="h-3 w-3" aria-hidden />
              {spec.labels.location}
            </dt>
            <dd className="truncate text-sm text-offwhite/90" title={o.country ?? undefined}>
              {o.country ?? "Belum diketahui"}
            </dd>
          </div>
        ) : (
          <div className="min-w-0">
            <dt className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <CalendarClock className="h-3 w-3" aria-hidden />
              {spec.labels.deadline}
            </dt>
            <dd className={cn("truncate text-sm", o.deadlineAt ? "text-offwhite/90" : "text-offwhite/60")}>
              {formatRelativeDeadline(o.deadlineAt)}
            </dd>
          </div>
        )}
      </dl>

      {jobTraits.length > 0 && (
        <ul className="mt-2.5 flex flex-wrap gap-1.5" aria-label="Detail pekerjaan">
          {jobTraits.map((t) => (
            <li key={t} className="rounded-md border border-border-faint px-1.5 py-0.5 text-[11px] text-offwhite/80">
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-offwhite/80 transition-colors group-hover:text-gold" aria-hidden>
          Lihat detail
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
        <CardBookmark id={o.id} title={o.title} />
      </div>
    </article>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="card-surface flex h-full flex-col p-4" aria-hidden>
      <div className="flex items-center gap-2">
        <div className="skeleton h-9 w-9 rounded-lg" />
        <div className="skeleton h-3 w-24 rounded" />
      </div>
      <div className="skeleton mt-4 h-4 w-11/12 rounded" />
      <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      <div className="skeleton mt-2 h-3 w-1/3 rounded" />
      <div className="skeleton mt-3 h-[92px] w-full rounded-xl" />
      <div className="mt-4 flex items-center justify-between">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}
