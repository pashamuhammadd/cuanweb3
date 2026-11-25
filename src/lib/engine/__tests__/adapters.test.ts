import { describe, expect, it, vi } from "vitest";
import { mapDevpostHackathon, parseDevpostPeriod } from "../adapters/devpost";
import { parseFeed, rssAdapter } from "../adapters/rss";
import { extractJobs, mapWeb3CareerJob, web3CareerAdapter } from "../adapters/web3career";
import { fetchWithRetry, HttpError } from "../http";
import { ConfigError, QuotaExceededError, type SourceConfig } from "../types";

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>EF</title>
<item><title>Academic Grants Round &amp;amp; more</title><link>https://blog.ethereum.org/en/2026/11/agr</link>
<guid>https://blog.ethereum.org/en/2026/11/agr</guid><pubDate>Tue, 24 Nov 2026 00:00:00 GMT</pubDate>
<description><![CDATA[<p>Funding $500,000</p>]]></description><category>Research</category></item>
<item><title>Second</title><link>https://blog.ethereum.org/b</link></item>
</channel></rss>`;

const ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title>X</title>
<entry><id>tag:x,1</id><title>Hackathon open</title><link rel="alternate" href="https://x.org/h"/><updated>2026-11-20T00:00:00Z</updated><summary>Join</summary></entry>
</feed>`;

const source: SourceConfig = {
  id: "s",
  key: "test_feed",
  name: "Test Blog",
  adapter: "rss",
  kind: "rss",
  url: "https://example.org/feed.xml",
  homepage_url: null,
  enabled: true,
  default_category: "grants",
  categories: [],
  ecosystems: [],
  keyword_filter: true,
  interval_minutes: 180,
  publish_mode: "manual",
  trusted: false,
  requires_api_key: false,
  api_key_env: null,
  is_paid: false,
  daily_quota: null,
  monthly_quota: null,
  http_etag: '"abc"',
  http_last_modified: null,
};

describe("rss parser", () => {
  it("parses RSS 2.0 items including CDATA descriptions", () => {
    const items = parseFeed(RSS, "EF");
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      externalId: "https://blog.ethereum.org/en/2026/11/agr",
      url: "https://blog.ethereum.org/en/2026/11/agr",
      organizer: "EF",
      tags: ["Research"],
    });
    expect(items[0]!.description).toContain("$500,000");
  });
  it("parses Atom entries", () => {
    expect(parseFeed(ATOM, null)[0]).toMatchObject({ externalId: "tag:x,1", url: "https://x.org/h", title: "Hackathon open" });
  });
  it("rejects non-feed documents", () => {
    expect(() => parseFeed("<html><body>hi</body></html>", null)).toThrow(/Format feed/);
  });
  it("sends conditional headers and handles 304 (cache)", async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>)["If-None-Match"]).toBe('"abc"');
      return new Response(null, { status: 304 });
    });
    const result = await rssAdapter.fetchItems(source, {
      beforeRequest: async () => {},
      env: {},
      fetchImpl: fetchImpl as unknown as typeof fetch,
      deadline: Date.now() + 10_000,
    });
    expect(result).toMatchObject({ items: [], notModified: true, requests: 1 });
  });
  it("skips conditional headers when ignoreCache is set (forced manual sync)", async () => {
    const fetchImpl = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect((init?.headers as Record<string, string>)["If-None-Match"]).toBeUndefined();
      return new Response(ATOM, { status: 200, headers: { "content-type": "application/atom+xml" } });
    });
    const result = await rssAdapter.fetchItems(source, {
      beforeRequest: async () => {},
      env: {},
      fetchImpl: fetchImpl as unknown as typeof fetch,
      deadline: Date.now() + 10_000,
      ignoreCache: true,
    });
    expect(result.items.length).toBeGreaterThan(0);
  });
});

describe("web3.career adapter", () => {
  it("extracts the nested jobs array and keeps apply_url untouched", () => {
    const jobs = extractJobs(["Terms", "Info", [{ id: 7, title: "Solidity Dev", company: "Acme", apply_url: "https://web3.career/x/7", url: "https://web3.career/x", tags: ["solidity"], remote: true, salary: "$120k" }]]);
    expect(jobs).toHaveLength(1);
    expect(mapWeb3CareerJob(jobs[0]!)).toMatchObject({
      externalId: "7",
      applyUrl: "https://web3.career/x/7",
      organizer: "Acme",
      categoryHint: "jobs",
      rewardText: "$120k",
    });
  });
  it("fails with a config error when the token is missing", async () => {
    await expect(
      web3CareerAdapter.fetchItems({ ...source, adapter: "web3career", api_key_env: "WEB3_CAREER_API_TOKEN" }, { beforeRequest: async () => {}, env: {}, deadline: Date.now() + 5000 }),
    ).rejects.toBeInstanceOf(ConfigError);
  });
});

describe("devpost adapter", () => {
  it("parses submission periods", () => {
    expect(parseDevpostPeriod("Nov 11, 2026 - Jan 11, 2027")).toEqual({ start: "2026-11-11T00:00:00.000Z", end: "2027-01-11T23:59:00.000Z" });
    expect(parseDevpostPeriod("Nov 11 - Dec 15, 2026").start).toBe("2026-11-11T00:00:00.000Z");
    expect(parseDevpostPeriod(null)).toEqual({ start: null, end: null });
  });
  it("keeps only web3 hackathons and strips prize html", () => {
    expect(mapDevpostHackathon({ title: "AI Jam", url: "https://a.devpost.com", themes: [{ name: "Machine Learning" }] })).toBeNull();
    expect(
      mapDevpostHackathon({ id: 1, title: "Chain Jam", url: "https://c.devpost.com", themes: [{ name: "Blockchain" }], prize_amount: "$<span data-currency-value>10,000</span>" }),
    ).toMatchObject({ rewardText: "$10,000", categoryHint: "hackathon" });
  });
});

describe("fetchWithRetry", () => {
  const deadline = () => Date.now() + 30_000;
  it("retries 503 then succeeds", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(new Response("busy", { status: 503, headers: { "retry-after": "0" } }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    const res = await fetchWithRetry("https://x.org", { deadline: deadline(), fetchImpl });
    expect(res.status).toBe(200);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
  it("does not retry 404", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("no", { status: 404 }));
    await expect(fetchWithRetry("https://x.org", { deadline: deadline(), fetchImpl })).rejects.toBeInstanceOf(HttpError);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
  it("stops immediately when the quota gate rejects", async () => {
    const fetchImpl = vi.fn();
    await expect(
      fetchWithRetry("https://x.org", {
        deadline: deadline(),
        fetchImpl,
        beforeRequest: async () => {
          throw new QuotaExceededError("x");
        },
      }),
    ).rejects.toBeInstanceOf(QuotaExceededError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
