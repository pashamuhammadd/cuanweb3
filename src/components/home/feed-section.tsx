"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
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

function matchesFilter(item: Opportunity, filter: FilterKey) {
  switch (filter) {
    case "tanpa-modal":
      return item.isFree;
    case "pemula":
      return item.tags.some((t) => t.toLowerCase().includes("pemula"));
    case "deadline-dekat": {
      if (!item.deadlineAt) return false;
      const days = (new Date(item.deadlineAt).getTime() - Date.now()) / 86_400_000;
      return days >= 0 && days <= 14;
    }
    default:
      return true;
  }
}

export function FeedSection({ items }: { items: Opportunity[] }) {
  const [active, setActive] = useState<FilterKey>("semua");

  const filtered = useMemo(
    () => items.filter((item) => matchesFilter(item, active)),
    [items, active],
  );

  return (
    <section aria-labelledby="feed-heading" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="feed-heading" className="font-heading text-xl font-bold text-offwhite md:text-2xl">
          Peluang terbaru
        </h2>
        <Link href="/peluang" className="text-sm font-medium text-gold hover:underline">
          Lihat semua →
        </Link>
      </div>

      <div
        role="group"
        aria-label="Filter peluang terbaru"
        className="mt-4 flex gap-2 overflow-x-auto pb-1"
      >
        {FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            aria-pressed={active === filter.key}
            onClick={() => setActive(filter.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === filter.key
                ? "bg-gold text-charcoal"
                : "border border-border-subtle text-offwhite/80 hover:border-teal hover:text-teal",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.length === 0 ? (
            <p className="col-span-full rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
              Belum ada peluang yang cocok dengan filter ini.
            </p>
          ) : (
            filtered.map((item) => <OpportunityCard key={item.id} opportunity={item} />)
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
