"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { cn } from "@/lib/cn";

type FilterKey = "semua" | "tanpa-modal" | "pemula" | "deadline-dekat";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "semua", label: "Semua" },
  { key: "tanpa-modal", label: "Tanpa modal" },
  { key: "pemula", label: "Untuk pemula" },
  { key: "deadline-dekat", label: "Deadline dekat" },
];

const LIMIT = 6;

function matchesFilter(item: Opportunity, filter: FilterKey, now: number) {
  switch (filter) {
    case "tanpa-modal":
      return item.isFree;
    case "pemula":
      return item.tags.some((t) => t.toLowerCase().includes("pemula"));
    case "deadline-dekat": {
      if (!item.deadlineAt) return false;
      const days = (new Date(item.deadlineAt).getTime() - now) / 86_400_000;
      return days >= 0 && days <= 14;
    }
    default:
      return true;
  }
}

export function FeedSection({ items }: { items: Opportunity[] }) {
  const [active, setActive] = useState<FilterKey>("semua");
  const [now] = useState(() => Date.now());

  const filtered = useMemo(() => items.filter((item) => matchesFilter(item, active, now)), [items, active, now]);
  const visible = filtered.slice(0, LIMIT);

  return (
    <section aria-labelledby="feed-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="feed-heading" className="font-heading text-lg font-bold text-offwhite md:text-xl">
          Peluang terbaru
        </h2>
        <Link
          href="/peluang"
          className="inline-flex min-h-10 items-center gap-1 rounded-lg px-1 text-sm font-medium text-gold underline-offset-4 hover:underline"
        >
          Lihat semua
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div role="group" aria-label="Filter peluang terbaru" className="no-scrollbar relative -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            aria-pressed={active === filter.key}
            onClick={() => setActive(filter.key)}
            className={cn(
              "press h-9 shrink-0 rounded-lg px-3.5 text-sm font-medium transition-colors",
              active === filter.key
                ? "bg-gold text-charcoal"
                : "border border-border-faint bg-surface text-offwhite/80 hover:border-teal hover:text-teal",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <p className="sr-only" aria-live="polite">
        {filtered.length} peluang cocok
      </p>

      <div key={active} className="mt-4 grid grid-cols-1 gap-3 motion-safe:animate-fade-up sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
        {visible.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
            Belum ada peluang yang cocok dengan filter ini.
          </p>
        ) : (
          visible.map((item) => <OpportunityCard key={item.id} opportunity={item} />)
        )}
      </div>

      {filtered.length > LIMIT && (
        <Link
          href="/peluang"
          className="press mt-4 flex h-11 items-center justify-center gap-1.5 rounded-xl border border-border-subtle bg-surface text-sm font-semibold text-offwhite transition-colors hover:border-gold hover:text-gold"
        >
          Lihat semua {items.length} peluang
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </section>
  );
}
