import "server-only";
import { DEMO_MARKET_ASSETS } from "./demo-data";
import { fetchCoinGeckoSnapshot } from "./coingecko";
import type { MarketSnapshot } from "./types";

export type { MarketAsset, MarketSnapshot, MarketSource } from "./types";

/**
 * Cache proses in-memory untuk fallback "stale" saat provider gagal.
 * Direset setiap kali server instance restart/redeploy. Untuk persistensi lintas
 * instance, simpan ke tabel market_snapshots pada fase berikutnya.
 */
let lastGoodSnapshot: { assets: MarketSnapshot["assets"]; fetchedAt: string } | null =
  null;

function isMarketProviderConfigured() {
  return process.env.MARKET_PROVIDER === "coingecko";
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  if (!isMarketProviderConfigured()) {
    return {
      source: "demo",
      assets: DEMO_MARKET_ASSETS,
      fetchedAt: new Date().toISOString(),
    };
  }

  try {
    const { assets, fetchedAt } = await fetchCoinGeckoSnapshot();
    lastGoodSnapshot = { assets, fetchedAt };
    return { source: "live", assets, fetchedAt };
  } catch (error) {
    if (lastGoodSnapshot) {
      return {
        source: "stale",
        assets: lastGoodSnapshot.assets,
        fetchedAt: lastGoodSnapshot.fetchedAt,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
    return {
      source: "demo",
      assets: DEMO_MARKET_ASSETS,
      fetchedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
