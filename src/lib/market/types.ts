export type MarketAssetId = "bitcoin" | "ethereum" | "solana" | "binancecoin";

export type MarketAsset = {
  id: MarketAssetId;
  symbol: string;
  name: string;
  priceUsd: number;
  priceIdr: number | null;
  change24hPct: number | null;
};

export type MarketSource = "live" | "stale" | "demo";

export type MarketSnapshot = {
  source: MarketSource;
  assets: MarketAsset[];
  fetchedAt: string;
  error?: string;
};
