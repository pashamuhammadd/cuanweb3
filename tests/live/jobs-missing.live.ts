import { it } from "vitest";
import { getAdapter } from "@/lib/engine/adapters";
import { normalizeItem } from "@/lib/engine/normalize";
import type { SourceConfig } from "@/lib/engine/types";

/** Diagnosis: lowongan mana yang belum memenuhi field wajib dan kenapa. */
it("diagnose job completeness", async () => {
  const source = { id: "j", key: "cryptocurrency_jobs", name: "Cryptocurrency Jobs", adapter: "rss", kind: "rss", url: "https://cryptocurrencyjobs.co/index.xml", homepage_url: null, enabled: true, default_category: "jobs", categories: ["jobs"], ecosystems: [], keyword_filter: false, interval_minutes: 180, publish_mode: "manual", trusted: true, requires_api_key: false, api_key_env: null, is_paid: false, daily_quota: null, monthly_quota: null, http_etag: null, http_last_modified: null } as SourceConfig;
  const r = await getAdapter("rss")!.fetchItems(source, { beforeRequest: async () => {}, env: {}, deadline: Date.now() + 30000 });
  for (const item of r.items) {
    const o = normalizeItem(item, source);
    if (o.ok && o.candidate.missing.length) console.log(`MISSING ${o.candidate.missing.join(",")} | ${item.title} | ${String(item.description).slice(0, 230)}`);
  }
});
