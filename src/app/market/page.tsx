import type { Metadata } from "next";
import { AlertTriangle, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { getMarketSnapshot } from "@/lib/market";
import { formatDateTime, formatIdr, formatPercent, formatUsd } from "@/lib/format";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";

export const metadata: Metadata = {
  title: "Market",
  description: "Harga BTC, ETH, SOL, dan BNB dalam USD dan IDR.",
  alternates: { canonical: "/market" },
};

const SOURCE_COPY: Record<string, { label: string; tone: string }> = {
  live: { label: "Live", tone: "bg-emerald-500/15 text-emerald-300" },
  stale: { label: "Data tertunda", tone: "bg-amber-500/15 text-amber-300" },
  demo: { label: "Market · Demo", tone: "bg-teal/15 text-teal" },
};

export default async function MarketPage() {
  const snapshot = await getMarketSnapshot();
  const sourceCopy = SOURCE_COPY[snapshot.source];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-6 md:py-8">
      <PageHeader
        title="Market"
        description="Harga aset kripto utama dalam USD dan Rupiah."
        actions={<span className={cn("rounded-lg px-2.5 py-1 text-xs font-semibold", sourceCopy.tone)}>{sourceCopy.label}</span>}
      />
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5" aria-hidden />
        Diperbarui {formatDateTime(snapshot.fetchedAt)}
      </p>

      {snapshot.source === "demo" && (
        <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Harga di halaman ini adalah data contoh untuk ilustrasi dan belum terhubung ke sumber harga live.
        </p>
      )}
      {snapshot.source === "stale" && (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Provider market sedang bermasalah, menampilkan data terakhir yang valid.
        </p>
      )}

      <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {snapshot.assets.map((asset) => {
          const change = asset.change24hPct;
          const up = (change ?? 0) >= 0;
          return (
            <li key={asset.id} className="card-surface p-4 md:p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-heading text-lg font-bold text-offwhite">{asset.symbol}</p>
                  <p className="text-xs text-muted-foreground">{asset.name}</p>
                </div>
                {change !== null && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2 py-1 font-mono text-xs font-semibold tabular-nums-fixed",
                      up ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300",
                    )}
                  >
                    {up ? <TrendingUp className="h-3.5 w-3.5" aria-hidden /> : <TrendingDown className="h-3.5 w-3.5" aria-hidden />}
                    <span className="sr-only">{up ? "Naik" : "Turun"} 24 jam: </span>
                    {formatPercent(change)}
                  </span>
                )}
              </div>
              <p className="mt-4 font-mono text-2xl font-semibold text-offwhite tabular-nums-fixed">{formatUsd(asset.priceUsd)}</p>
              {asset.priceIdr !== null && (
                <p className="mt-0.5 font-mono text-sm text-muted-foreground tabular-nums-fixed">{formatIdr(asset.priceIdr)}</p>
              )}
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        Informasi harga bukan saran investasi. Perubahan dihitung dalam 24 jam terakhir.
      </p>
    </div>
  );
}
