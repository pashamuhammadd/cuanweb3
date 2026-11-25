import Link from "next/link";
import { ArrowRight, Info, TrendingDown, TrendingUp } from "lucide-react";
import type { MarketSnapshot } from "@/lib/market/types";
import { formatPercent, formatUsd } from "@/lib/format";
import { cn } from "@/lib/cn";

const SOURCE_LABEL: Record<MarketSnapshot["source"], string> = {
  live: "Market",
  stale: "Market · Data tertunda",
  demo: "Market · Demo",
};

const SOURCE_HINT: Record<MarketSnapshot["source"], string> = {
  live: "Harga dari provider market.",
  stale: "Provider bermasalah; menampilkan data valid terakhir.",
  demo: "Harga contoh untuk ilustrasi, belum terhubung ke data live.",
};

/**
 * Baris harga statis (tanpa animasi). Mobile: bisa digeser horizontal di dalam
 * barisnya sendiri; halaman tidak ikut melebar.
 */
export function MarketTicker({ snapshot, className }: { snapshot: MarketSnapshot; className?: string }) {
  return (
    <div className={cn("flex h-11 items-center gap-3 text-[13px]", className)} role="group" aria-label="Ringkasan harga aset kripto">
      <span className="inline-flex shrink-0 items-center gap-1.5 font-medium text-offwhite" title={SOURCE_HINT[snapshot.source]}>
        {SOURCE_LABEL[snapshot.source]}
        <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <span className="sr-only">. {SOURCE_HINT[snapshot.source]}</span>
      </span>
      <span className="h-4 w-px shrink-0 bg-border-strong" aria-hidden />

      <div className="no-scrollbar relative min-w-0 flex-1 overflow-x-auto" tabIndex={0} aria-label="Daftar harga, geser untuk melihat lainnya">
        <ul className="flex w-max items-center">
          {snapshot.assets.map((asset, i) => {
            const up = (asset.change24hPct ?? 0) >= 0;
            return (
              <li
                key={asset.id}
                className={cn("flex items-center gap-2 px-4 whitespace-nowrap first:pl-0", i > 0 && "border-l border-border-subtle")}
              >
                <span className="font-semibold text-offwhite">{asset.symbol}</span>
                <span className="font-mono text-offwhite/85 tabular-nums-fixed">{formatUsd(asset.priceUsd)}</span>
                {asset.change24hPct !== null && (
                  <span className={cn("inline-flex items-center gap-0.5 font-mono tabular-nums-fixed", up ? "text-emerald-400" : "text-rose-400")}>
                    {up ? <TrendingUp className="h-3 w-3" aria-hidden /> : <TrendingDown className="h-3 w-3" aria-hidden />}
                    <span className="sr-only">{up ? "naik" : "turun"}</span>
                    {formatPercent(asset.change24hPct)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        href="/market"
        className="hidden min-h-10 shrink-0 items-center gap-1 rounded-lg px-1 text-[13px] font-medium text-gold underline-offset-4 hover:underline md:inline-flex"
      >
        Lihat Market
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
