"use client";

import { useState } from "react";
import { Pause, Play, TrendingDown, TrendingUp } from "lucide-react";
import type { MarketSnapshot } from "@/lib/market/types";
import { formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

const SOURCE_LABEL: Record<MarketSnapshot["source"], string> = {
  live: "Market",
  stale: "Market · Data tertunda",
  demo: "Market · Demo",
};

function Items({ snapshot, hidden }: { snapshot: MarketSnapshot; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center gap-5 pr-5" aria-hidden={hidden || undefined}>
      {snapshot.assets.map((asset) => {
        const up = (asset.change24hPct ?? 0) >= 0;
        return (
          <li key={asset.id} className="flex items-center gap-1.5 whitespace-nowrap font-mono tabular-nums-fixed">
            <span className="font-sans font-semibold text-offwhite">{asset.symbol}</span>
            <span className="text-offwhite/75">{formatUsd(asset.priceUsd)}</span>
            {asset.change24hPct !== null && (
              <span className={cn("inline-flex items-center gap-0.5", up ? "text-emerald-400" : "text-rose-400")}>
                {up ? <TrendingUp className="h-3 w-3" aria-hidden /> : <TrendingDown className="h-3 w-3" aria-hidden />}
                <span className="sr-only">{up ? "naik" : "turun"}</span>
                {formatPercent(asset.change24hPct)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Mobile: baris bisa digeser horizontal (tanpa animasi).
 * Desktop: berjalan pelan, berhenti saat hover/fokus, dan bisa dijeda (WCAG 2.2.2).
 */
export function MarketTicker({ snapshot, className }: { snapshot: MarketSnapshot; className?: string }) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={cn(
        "flex h-9 items-center gap-2 rounded-xl border border-border-faint bg-surface/70 pl-1.5 pr-1 text-xs",
        className,
      )}
      role="group"
      aria-label="Ringkasan harga aset kripto"
    >
      <span
        className={cn(
          "shrink-0 rounded-lg px-2 py-1 text-[11px] font-semibold",
          snapshot.source === "live" ? "bg-emerald-500/15 text-emerald-300" : "bg-teal/20 text-teal",
        )}
      >
        {SOURCE_LABEL[snapshot.source]}
      </span>

      {/* Mobile: geser manual */}
      <div className="no-scrollbar relative flex-1 overflow-x-auto md:hidden" tabIndex={0} aria-label="Geser untuk melihat harga lain">
        <Items snapshot={snapshot} />
      </div>

      {/* Desktop: marquee */}
      <div className="group relative hidden flex-1 overflow-hidden md:block [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
        <div
          className={cn(
            "flex w-max motion-safe:animate-ticker group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]",
            paused && "[animation-play-state:paused]",
          )}
        >
          <Items snapshot={snapshot} />
          <Items snapshot={snapshot} hidden />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-raised hover:text-offwhite motion-safe:md:inline-flex"
      >
        {paused ? <Play className="h-3.5 w-3.5" aria-hidden /> : <Pause className="h-3.5 w-3.5" aria-hidden />}
        <span className="sr-only">{paused ? "Jalankan ticker" : "Jeda ticker"}</span>
      </button>
    </div>
  );
}
