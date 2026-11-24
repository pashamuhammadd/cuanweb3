import Link from "next/link";
import { Gift, Clock } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { getCategory } from "@/lib/nav";
import { ecosystemLabel } from "@/lib/categories";
import { formatRelativeDeadline } from "@/lib/format";
import { cn } from "@/lib/cn";

export function OpportunityCard({
  opportunity,
  className,
}: {
  opportunity: Opportunity;
  className?: string;
}) {
  const category = getCategory(opportunity.category);
  const Icon = category.icon;
  const ecosystems = opportunity.ecosystems ?? [];

  return (
    <Link
      href={`/peluang/${opportunity.slug}`}
      className={cn(
        "group flex flex-col rounded-2xl border border-border-subtle bg-surface p-4 transition-all duration-200 hover:-translate-y-1 hover:border-teal/60 hover:shadow-[0_8px_30px_-12px_rgba(37,140,131,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {opportunity.isDemo && (
            <span className="rounded-full bg-surface-raised px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              Contoh
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-[11px] font-medium text-teal">
            <Icon className="h-3 w-3" aria-hidden />
            {category.label}
          </span>
          {ecosystems.length > 0 && (
            <span className="truncate text-[11px] text-muted-foreground">
              {ecosystems.slice(0, 2).map(ecosystemLabel).join(" · ")}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-heading text-base font-semibold leading-snug text-offwhite group-hover:text-gold">
        {opportunity.title}
      </h3>
      {opportunity.organizer && (
        <p className="mt-1 truncate text-xs text-muted-foreground">oleh {opportunity.organizer}</p>
      )}
      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
        {opportunity.summary}
      </p>

      <div className="mt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-1.5 text-offwhite/90">
          <Gift className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
          <span className="truncate">
            {opportunity.category === "jobs" ? "Kompensasi" : "Reward"}: {opportunity.rewardDescription ?? "Belum diketahui"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Deadline: {formatRelativeDeadline(opportunity.deadlineAt)}</span>
        </div>
      </div>

      <span
        className={cn(
          "mt-4 inline-flex w-full items-center justify-center rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-offwhite transition-colors group-hover:border-gold group-hover:text-gold",
        )}
      >
        Lihat detail →
      </span>
    </Link>
  );
}

export function OpportunityCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-2xl border border-border-subtle bg-surface p-4">
      <div className="mb-3 h-4 w-20 rounded-full bg-surface-raised" />
      <div className="h-5 w-3/4 rounded bg-surface-raised" />
      <div className="mt-2 h-4 w-full rounded bg-surface-raised" />
      <div className="mt-1 h-4 w-2/3 rounded bg-surface-raised" />
      <div className="mt-4 h-4 w-1/2 rounded bg-surface-raised" />
      <div className="mt-2 h-4 w-1/3 rounded bg-surface-raised" />
      <div className="mt-4 h-9 w-full rounded-full bg-surface-raised" />
    </div>
  );
}
