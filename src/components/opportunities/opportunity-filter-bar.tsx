"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { cn } from "@/lib/cn";

function isDeadlineWithinDays(deadlineAt: string, days: number): boolean {
  const diffDays = (new Date(deadlineAt).getTime() - Date.now()) / 86_400_000;
  return diffDays >= 0 && diffDays <= days;
}

export function OpportunityFilterBar({ items }: { items: Opportunity[] }) {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState<string>("semua");
  const [freeOnly, setFreeOnly] = useState(false);
  const [deadlineSoon, setDeadlineSoon] = useState(false);

  const skills = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => item.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (search) {
        const q = search.toLowerCase();
        const matches =
          item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (skill !== "semua" && !item.tags.includes(skill)) return false;
      if (freeOnly && !item.isFree) return false;
      if (deadlineSoon) {
        if (!item.deadlineAt || !isDeadlineWithinDays(item.deadlineAt, 14)) return false;
      }
      return true;
    });
  }, [items, search, skill, freeOnly, deadlineSoon]);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Cari peluang</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul atau kata kunci…"
            className="w-full rounded-full border border-border-subtle bg-surface py-2.5 pl-10 pr-4 text-sm text-offwhite placeholder:text-muted-foreground focus:border-teal"
          />
        </label>

        <select
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          className="rounded-full border border-border-subtle bg-surface px-4 py-2.5 text-sm text-offwhite focus:border-teal"
          aria-label="Filter skill/tag"
        >
          <option value="semua">Semua skill</option>
          {skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <ToggleChip active={freeOnly} onClick={() => setFreeOnly((v) => !v)}>
            Tanpa modal
          </ToggleChip>
          <ToggleChip active={deadlineSoon} onClick={() => setDeadlineSoon((v) => !v)}>
            Deadline dekat
          </ToggleChip>
        </div>
      </div>

      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        Menampilkan {filtered.length} dari {items.length} peluang
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="col-span-full rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
            Belum ada peluang yang cocok dengan filter ini.
          </p>
        ) : (
          filtered.map((item) => <OpportunityCard key={item.id} opportunity={item} />)
        )}
      </div>
    </div>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors",
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-border-subtle text-offwhite/80 hover:border-teal hover:text-teal",
      )}
    >
      {children}
    </button>
  );
}
