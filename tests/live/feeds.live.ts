import { describe, expect, it } from "vitest";
import { getAdapter } from "@/lib/engine/adapters";
import { normalizeItem } from "@/lib/engine/normalize";
import type { SourceConfig } from "@/lib/engine/types";

/** Sumber RSS aktif dari migrasi 0002 (tanpa DB). */
const FEEDS: Array<Pick<SourceConfig, "key" | "name" | "url" | "default_category" | "categories" | "ecosystems" | "keyword_filter">> = [
  { key: "ethereum_foundation_blog", name: "Ethereum Foundation Blog", url: "https://blog.ethereum.org/feed.xml", default_category: "grants", categories: ["grants", "hackathon", "bounty", "testnet"], ecosystems: ["ethereum"], keyword_filter: true },
  { key: "sui_blog", name: "Sui Blog", url: "https://blog.sui.io/rss/", default_category: "grants", categories: ["grants", "hackathon", "bounty", "testnet", "ambassador"], ecosystems: ["sui"], keyword_filter: true },
  { key: "aptos_labs_medium", name: "Aptos Labs (Medium)", url: "https://medium.com/feed/aptoslabs", default_category: "grants", categories: ["grants", "hackathon", "bounty", "testnet", "ambassador"], ecosystems: ["aptos"], keyword_filter: true },
  { key: "arbitrum_blog", name: "Arbitrum Blog", url: "https://blog.arbitrum.io/rss/", default_category: "grants", categories: ["grants", "hackathon", "bounty", "ambassador"], ecosystems: ["arbitrum"], keyword_filter: true },
  { key: "base_blog", name: "Base Blog", url: "https://www.base.org/blog/rss.xml", default_category: "grants", categories: ["grants", "hackathon", "bounty", "contest"], ecosystems: ["base"], keyword_filter: true },
  { key: "cryptocurrency_jobs", name: "Cryptocurrency Jobs", url: "https://cryptocurrencyjobs.co/index.xml", default_category: "jobs", categories: ["jobs"], ecosystems: [], keyword_filter: false },
];

describe("live RSS sources", () => {
  for (const feed of FEEDS) {
    it(`fetches and normalizes ${feed.key}`, async () => {
      const source: SourceConfig = {
        ...feed, id: feed.key, adapter: "rss", kind: "rss", homepage_url: null, enabled: true,
        interval_minutes: 180, publish_mode: "manual", trusted: true, requires_api_key: false,
        api_key_env: null, is_paid: false, daily_quota: 16, monthly_quota: 500, http_etag: null, http_last_modified: null,
      };
      let requests = 0;
      const result = await getAdapter("rss")!.fetchItems(source, {
        beforeRequest: async () => { requests++; },
        env: {},
        deadline: Date.now() + 45_000,
      });
      expect(result.items.length).toBeGreaterThan(0);
      const outcomes = result.items.map((item) => normalizeItem(item, source));
      const ok = outcomes.filter((o) => o.ok);
      const counts = { fetched: result.items.length, relevant: ok.length, irrelevant: outcomes.filter((o) => !o.ok && o.reason === "irrelevant").length, invalid: outcomes.filter((o) => !o.ok && o.reason === "invalid").length, requests };
      console.log(`\n[${feed.key}] ${JSON.stringify(counts)}`);
      for (const o of ok.slice(0, 3)) if (o.ok) {
        const c = o.candidate;
        console.log(`  - [${c.category}] ${c.title}\n    org=${c.organizer ?? "-"} eco=${c.ecosystems.join(",") || "-"} reward=${c.rewardDescription ?? "?"} risk=${c.riskLevel} missing=${c.missing.join(",")}\n    ${c.summary}`);
      }
      expect(counts.invalid).toBeLessThan(counts.fetched);
    });
  }
});
