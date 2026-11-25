import type { Metadata } from "next";
import { AlertTriangle } from "lucide-react";
import { getMarketSnapshot } from "@/lib/market";
import { formatIdr, formatPercent, formatUsd } from "@/lib/format";

export const metadata: Metadata = {
  title: "Market",
  description: "Harga BTC, ETH, SOL, dan BNB dalam USD dan IDR.",
  alternates: { canonical: "/market" },
};

const SOURCE_COPY: Record<string, { label: string; tone: string }> = {
  live: { label: "Live", tone: "bg-emerald-500/15 text-emerald-400" },
  stale: { label: "Data tertunda", tone: "bg-amber-500/15 text-amber-400" },
  demo: { label: "Demo", tone: "bg-teal/15 text-teal" },
};

export default async function MarketPage() {
  const snapshot = await getMarketSnapshot();
  const sourceCopy = SOURCE_COPY[snapshot.source];

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-offwhite">Market</h1>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${sourceCopy.tone}`}>
          {sourceCopy.label}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Diperbarui {new Date(snapshot.fetchedAt).toLocaleString("id-ID")}
      </p>

      {snapshot.source === "demo" && (
        <p className="mt-4 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-xs text-muted-foreground">
          Menampilkan data contoh. Set MARKET_PROVIDER=coingecko di .env.local
          untuk mengaktifkan harga live dari CoinGecko.
        </p>
      )}
      {snapshot.source === "stale" && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          Provider market sedang bermasalah, menampilkan data terakhir yang valid.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.assets.map((asset) => (
          <div key={asset.id} className="rounded-2xl border border-border-subtle bg-surface p-5">
            <div className="flex items-center justify-between">
              <span className="font-heading font-bold text-offwhite">{asset.symbol}</span>
              {asset.change24hPct !== null && (
                <span
                  className={
                    asset.change24hPct >= 0
                      ? "text-sm font-medium text-emerald-400"
                      : "text-sm font-medium text-rose-400"
                  }
                >
                  {formatPercent(asset.change24hPct)}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{asset.name}</p>
            <p className="tabular-nums-fixed mt-3 text-lg font-semibold text-offwhite">
              {formatUsd(asset.priceUsd)}
            </p>
            {asset.priceIdr !== null && (
              <p className="tabular-nums-fixed text-sm text-muted-foreground">
                {formatIdr(asset.priceIdr)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
