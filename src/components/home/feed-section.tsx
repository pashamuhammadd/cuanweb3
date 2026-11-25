"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Opportunity } from "@/types/opportunity";
import { ArrowRight } from "lucide-react";
import { FeedCard } from "./feed-card";
import { cn } from "@/lib/cn";

/** Jumlah peluang terbaru yang tampil di beranda. */
const FEED_LIMIT = 8;

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
    () =>
      items
        .filter((item) => matchesFilter(item, active))
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
        .slice(0, FEED_LIMIT),
    [items, active],
  );

  return (
    <section aria-labelledby="feed-heading" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="feed-heading" className="font-heading text-xl font-bold text-offwhite md:text-2xl">
          Peluang terbaru
        </h2>
        <span className="font-mono text-xs text-muted-foreground">
          {String(filtered.length).padStart(2, "0")} terbaru
        </span>
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
        <motion.ol
          key={active}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {filtered.length === 0 ? (
            <li className="col-span-full rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
              Belum ada peluang yang cocok dengan filter ini.
            </li>
          ) : (
            filtered.map((item, i) => (
              <FeedCard key={item.id} opportunity={item} index={i} total={filtered.length} />
            ))
          )}
        </motion.ol>
      </AnimatePresence>

      <div className="mt-8 flex justify-center">
        <Link
          href="/peluang"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/60 px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold hover:text-charcoal"
        >
          Lihat semua peluang
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
