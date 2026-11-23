import type { MarketAsset, MarketAssetId } from "./types";

const COINGECKO_IDS: MarketAssetId[] = [
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
];

const SYMBOLS: Record<MarketAssetId, { symbol: string; name: string }> = {
  bitcoin: { symbol: "BTC", name: "Bitcoin" },
  ethereum: { symbol: "ETH", name: "Ethereum" },
  solana: { symbol: "SOL", name: "Solana" },
  binancecoin: { symbol: "BNB", name: "BNB" },
};

type CoinGeckoResponse = Record<
  string,
  { usd?: number; idr?: number; usd_24h_change?: number }
>;

/**
 * Mengambil harga dari CoinGecko public API (tanpa API key, rate-limited).
 * Melempar error bila request gagal atau format tidak sesuai dugaan — pemanggil
 * bertanggung jawab melakukan fallback ke data terakhir yang valid.
 */
export async function fetchCoinGeckoSnapshot(): Promise<{
  assets: MarketAsset[];
  fetchedAt: string;
}> {
  const params = new URLSearchParams({
    ids: COINGECKO_IDS.join(","),
    vs_currencies: "usd,idr",
    include_24hr_change: "true",
  });

  const headers: Record<string, string> = {};
  if (process.env.MARKET_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.MARKET_API_KEY;
  }

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`,
    {
      headers,
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    throw new Error(`CoinGecko responded ${res.status}`);
  }

  const data = (await res.json()) as CoinGeckoResponse;

  const assets: MarketAsset[] = COINGECKO_IDS.map((id) => {
    const entry = data[id];
    if (!entry || typeof entry.usd !== "number") {
      throw new Error(`CoinGecko missing data for ${id}`);
    }
    return {
      id,
      symbol: SYMBOLS[id].symbol,
      name: SYMBOLS[id].name,
      priceUsd: entry.usd,
      priceIdr: typeof entry.idr === "number" ? entry.idr : null,
      change24hPct:
        typeof entry.usd_24h_change === "number" ? entry.usd_24h_change : null,
    };
  });

  return { assets, fetchedAt: new Date().toISOString() };
}
