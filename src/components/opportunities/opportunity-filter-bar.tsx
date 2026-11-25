"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowDownWideNarrow, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import type { Opportunity, OpportunityCategory } from "@/types/opportunity";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { CATEGORY_LABELS } from "@/lib/categories";
import { cn } from "@/lib/cn";

type Sort = "terbaru" | "deadline";
const PAGE = 24;

function withinDays(deadlineAt: string, days: number, now: number): boolean {
  const diffDays = (new Date(deadlineAt).getTime() - now) / 86_400_000;
  return diffDays >= 0 && diffDays <= days;
}

const fieldClass =
  "h-11 w-full rounded-xl border border-border-faint bg-surface px-3 text-sm text-offwhite transition-colors hover:border-border-subtle focus:border-teal";

export function OpportunityFilterBar({
  items,
  showCategoryFilter = false,
}: {
  items: Opportunity[];
  showCategoryFilter?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<OpportunityCategory | "semua">("semua");
  const [skill, setSkill] = useState<string>("semua");
  const [freeOnly, setFreeOnly] = useState(false);
  const [deadlineSoon, setDeadlineSoon] = useState(false);
  const [sort, setSort] = useState<Sort>("terbaru");
  const [limit, setLimit] = useState(PAGE);
  const [now] = useState(() => Date.now());
  const sheetRef = useRef<HTMLDialogElement>(null);

  const categories = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return (Object.keys(CATEGORY_LABELS) as OpportunityCategory[]).filter((c) => present.has(c));
  }, [items]);

  const skills = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => [...item.tags, ...(item.skills ?? [])].forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = items.filter((item) => {
      if (q) {
        const hay = `${item.title} ${item.summary} ${item.organizer ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category !== "semua" && item.category !== category) return false;
      if (skill !== "semua" && !item.tags.includes(skill) && !(item.skills ?? []).includes(skill)) return false;
      if (freeOnly && !item.isFree) return false;
      if (deadlineSoon && (!item.deadlineAt || !withinDays(item.deadlineAt, 14, now))) return false;
      return true;
    });
    if (sort === "deadline") {
      // Deadline terdekat dulu; tanpa deadline di akhir. Urutan asli (terbaru) dipertahankan untuk seri.
      return [...result].sort((a, b) => {
        const da = a.deadlineAt ? Date.parse(a.deadlineAt) : Infinity;
        const db = b.deadlineAt ? Date.parse(b.deadlineAt) : Infinity;
        return da - db;
      });
    }
    return result;
  }, [items, search, category, skill, freeOnly, deadlineSoon, sort, now]);

  const activeCount = [category !== "semua", skill !== "semua", freeOnly, deadlineSoon, sort !== "terbaru"].filter(Boolean).length;
  const reset = () => {
    setSearch("");
    setCategory("semua");
    setSkill("semua");
    setFreeOnly(false);
    setDeadlineSoon(false);
    setSort("terbaru");
    setLimit(PAGE);
  };

  const controls = (idPrefix: string) => (
    <>
      {showCategoryFilter && categories.length > 1 && (
        <div className="md:w-48">
          <label htmlFor={`${idPrefix}-cat`} className="mb-1 block text-xs font-medium text-muted-foreground md:sr-only">
            Kategori
          </label>
          <select
            id={`${idPrefix}-cat`}
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as OpportunityCategory | "semua");
              setLimit(PAGE);
            }}
            className={fieldClass}
          >
            <option value="semua">Semua kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="md:w-44">
        <label htmlFor={`${idPrefix}-skill`} className="mb-1 block text-xs font-medium text-muted-foreground md:sr-only">
          Skill
        </label>
        <select
          id={`${idPrefix}-skill`}
          value={skill}
          onChange={(e) => {
            setSkill(e.target.value);
            setLimit(PAGE);
          }}
          className={fieldClass}
        >
          <option value="semua">Semua skill</option>
          {skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="md:w-44">
        <label htmlFor={`${idPrefix}-sort`} className="mb-1 block text-xs font-medium text-muted-foreground md:sr-only">
          Urutkan
        </label>
        <select id={`${idPrefix}-sort`} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={fieldClass}>
          <option value="terbaru">Terbaru</option>
          <option value="deadline">Deadline terdekat</option>
        </select>
      </div>
      <div className="flex gap-2">
        <ToggleChip active={freeOnly} onClick={() => setFreeOnly((v) => !v)}>
          Tanpa modal
        </ToggleChip>
        <ToggleChip active={deadlineSoon} onClick={() => setDeadlineSoon((v) => !v)}>
          Deadline dekat
        </ToggleChip>
      </div>
    </>
  );

  return (
    <div>
      <div className="flex gap-2 md:flex-wrap md:items-center">
        <div className="relative min-w-0 flex-1 md:min-w-64">
          <label htmlFor="cari-peluang" className="sr-only">
            Cari peluang
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <input
            id="cari-peluang"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Cari judul, perusahaan, kata kunci"
            className={cn(fieldClass, "pl-9")}
          />
        </div>

        {/* Mobile: buka bottom sheet */}
        <button
          type="button"
          onClick={() => sheetRef.current?.showModal()}
          className="press relative inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border-faint bg-surface px-3.5 text-sm font-medium text-offwhite md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden />
          Filter
          {activeCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-bold text-charcoal">
              {activeCount}
              <span className="sr-only"> filter aktif</span>
            </span>
          )}
        </button>

        {/* Desktop: kontrol inline */}
        <div className="hidden md:contents">{controls("d")}</div>
      </div>

      <dialog
        ref={sheetRef}
        aria-labelledby="filter-sheet-title"
        className="m-0 mt-auto max-h-[85dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-border-subtle bg-surface-overlay p-0 text-offwhite backdrop:bg-black/60 backdrop:backdrop-blur-sm md:hidden"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="pb-safe px-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" aria-hidden />
          <div className="flex items-center justify-between">
            <h2 id="filter-sheet-title" className="font-heading text-lg font-bold">
              Filter peluang
            </h2>
            <button
              type="button"
              onClick={() => sheetRef.current?.close()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-surface-raised"
            >
              <X className="h-5 w-5" aria-hidden />
              <span className="sr-only">Tutup filter</span>
            </button>
          </div>
          <div className="mt-3 space-y-3">{controls("m")}</div>
          <div className="mt-5 mb-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={reset}
              className="press h-12 rounded-xl border border-border-subtle text-sm font-semibold text-offwhite"
            >
              Atur ulang
            </button>
            <button
              type="button"
              onClick={() => sheetRef.current?.close()}
              className="press h-12 rounded-xl bg-gold text-sm font-semibold text-charcoal"
            >
              Tampilkan {filtered.length} hasil
            </button>
          </div>
        </div>
      </dialog>

      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Menampilkan <span className="font-mono text-offwhite tabular-nums-fixed">{Math.min(limit, filtered.length)}</span> dari{" "}
          <span className="font-mono text-offwhite tabular-nums-fixed">{filtered.length}</span> peluang
          {sort === "deadline" && (
            <span className="ml-1 inline-flex items-center gap-1">
              <ArrowDownWideNarrow className="h-3.5 w-3.5" aria-hidden />
              deadline terdekat
            </span>
          )}
        </p>
        {(activeCount > 0 || search) && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-1 text-sm font-medium text-teal hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Atur ulang
          </button>
        )}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border-subtle p-8 text-center">
            <p className="font-semibold text-offwhite">Belum ada peluang yang cocok.</p>
            <p className="mt-1 text-sm text-muted-foreground">Coba kata kunci lain atau atur ulang filter.</p>
            {(activeCount > 0 || search) && (
              <button
                type="button"
                onClick={reset}
                className="press mt-4 inline-flex h-11 items-center rounded-xl border border-border-strong px-4 text-sm font-semibold text-offwhite hover:border-teal hover:text-teal"
              >
                Atur ulang filter
              </button>
            )}
          </div>
        ) : (
          filtered.slice(0, limit).map((item) => <OpportunityCard key={item.id} opportunity={item} headingLevel="h2" />)
        )}
      </div>

      {filtered.length > limit && (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE)}
          className="press mx-auto mt-5 flex h-11 items-center rounded-xl border border-border-subtle bg-surface px-5 text-sm font-semibold text-offwhite hover:border-gold hover:text-gold"
        >
          Tampilkan lebih banyak ({filtered.length - limit} lagi)
        </button>
      )}
    </div>
  );
}

function ToggleChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "press h-11 flex-1 shrink-0 rounded-xl border px-3.5 text-sm font-medium whitespace-nowrap transition-colors md:flex-none",
        active ? "border-gold/60 bg-gold/15 text-gold" : "border-border-faint bg-surface text-offwhite/80 hover:border-teal hover:text-teal",
      )}
    >
      {children}
    </button>
  );
}
