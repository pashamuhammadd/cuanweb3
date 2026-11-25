"use client";

import { motion, useReducedMotion } from "motion/react";
import type { MarketSnapshot } from "@/lib/market/types";
import { formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

const SOURCE_LABEL: Record<MarketSnapshot["source"], string> = {
  live: "Market",
  stale: "Market • Data tertunda",
  demo: "Market • Demo",
};

export function MarketTicker({
  snapshot,
  className,
}: {
  snapshot: MarketSnapshot;
  className?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const items = [...snapshot.assets, ...snapshot.assets];

  return (
    <div
      className={cn(
        "flex items-center gap-3 overflow-hidden rounded-full border border-border-subtle bg-surface/80 px-3 py-1.5 text-xs",
        className,
      )}
      role="group"
      aria-label="Ringkasan harga aset kripto"
    >
      <span className="shrink-0 rounded-full bg-teal/20 px-2 py-0.5 font-medium text-teal">
        {SOURCE_LABEL[snapshot.source]}
      </span>
      <div className="relative flex-1 overflow-hidden">
        <motion.div
          className="flex w-max gap-6"
          animate={prefersReducedMotion ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        >
          {items.map((asset, i) => (
            <div
              key={`${asset.id}-${i}`}
              className="flex items-center gap-1.5 whitespace-nowrap tabular-nums-fixed"
            >
              <span className="font-semibold text-offwhite">{asset.symbol}</span>
              <span className="text-muted-foreground">{formatUsd(asset.priceUsd)}</span>
              {asset.change24hPct !== null && (
                <span
                  className={
                    asset.change24hPct >= 0 ? "text-emerald-400" : "text-rose-400"
                  }
                >
                  {formatPercent(asset.change24hPct)}
                </span>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
