import type { MarketAsset } from "./types";

/**
 * Data contoh untuk mode pengembangan / saat provider market belum dikonfigurasi.
 * Jangan pernah ditampilkan ke pengguna sebagai data live — selalu beri label "Demo".
 */
export const DEMO_MARKET_ASSETS: MarketAsset[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    priceUsd: 104320,
    priceIdr: 1_654_000_000,
    change24hPct: 1.28,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    priceUsd: 3487.6,
    priceIdr: 55_340_000,
    change24hPct: 1.63,
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    priceUsd: 240.16,
    priceIdr: 3_810_000,
    change24hPct: 2.07,
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    priceUsd: 704.9,
    priceIdr: 11_190_000,
    change24hPct: 1.19,
  },
];
