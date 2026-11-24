import { describe, expect, it, vi } from "vitest";
import { detectCategory, detectEcosystems, detectRewardCertainty, parseReward } from "../classify";
import { findDuplicate, titleSimilarity, type ExistingRef } from "../dedupe";
import { normalizeItem } from "../normalize";
import { assessRisk } from "../risk";
import { cleanTitle, decodeEntities, slugify, stripHtml, truncate } from "../text";
import { canonicalUrl } from "../url";
import { decidePublish, deadlineStatus, isStale } from "../validate";
import { makeQuotaGate, estimateCostUsd } from "../quota";
import { QuotaExceededError, type SourceConfig } from "../types";

const rssSource: SourceConfig = {
  id: "src-1",
  key: "ethereum_foundation_blog",
  name: "Ethereum Foundation Blog",
  adapter: "rss",
  kind: "rss",
  url: "https://blog.ethereum.org/feed.xml",
  homepage_url: null,
  enabled: true,
  default_category: "grants",
  categories: ["grants", "hackathon", "bounty", "testnet"],
  ecosystems: ["ethereum"],
  keyword_filter: true,
  interval_minutes: 180,
  publish_mode: "manual",
  trusted: true,
  requires_api_key: false,
  api_key_env: null,
  is_paid: false,
  daily_quota: 16,
  monthly_quota: 500,
  http_etag: null,
  http_last_modified: null,
};

describe("text", () => {
  it("decodes double-escaped entities", () => {
    expect(decodeEntities("R&amp;amp;D &#8211; ok")).toBe("R&D – ok");
  });
  it("strips html and scripts", () => {
    expect(stripHtml("<p>Hi <b>there</b></p><script>x()</script>")).toBe("Hi there");
  });
  it("slugifies and truncates on word boundary", () => {
    expect(slugify("Grant Ronde #3 — Ekosistem Ethereum!")).toBe("grant-ronde-3-ekosistem-ethereum");
    expect(truncate("satu dua tiga empat lima", 14)).toBe("satu dua tiga…");
    expect(cleanTitle("  <b>Hello</b>   world ")).toBe("Hello world");
  });
});

describe("canonicalUrl", () => {
  it("removes tracking params, www, trailing slash and hash", () => {
    expect(canonicalUrl("https://www.Example.com/path/?utm_source=x&b=2&a=1#top")).toBe(
      "https://example.com/path?a=1&b=2",
    );
  });
});

describe("classification", () => {
  it("detects category from title, respecting allowed list", () => {
    expect(detectCategory("Announcing the Q3 Academic Grants Round", "", []).category).toBe("grants");
    expect(detectCategory("ETHGlobal Hackathon is back", "", ["grants"]).category).toBeNull();
    expect(detectCategory("Protocol upgrade notes", "grant grant program", []).category).toBe("grants");
    expect(detectCategory("Protocol upgrade notes", "one grant mention", []).category).toBeNull();
  });
  it("detects ecosystems including source defaults", () => {
    expect(detectEcosystems("Build on Solana and Arbitrum", ["ethereum"]).sort()).toEqual(["arbitrum", "ethereum", "solana"]);
  });
  it("parses only explicit rewards and never invents", () => {
    expect(parseReward("Total prize pool of $25,000 for builders")).toMatchObject({ value: 25000, currency: "USD", type: "fiat" });
    expect(parseReward("Up to 50k USDC in grants")).toMatchObject({ value: 50000, currency: "USDC", type: "stablecoin" });
    expect(parseReward("$1.5M ecosystem fund")).toMatchObject({ value: 1_500_000 });
    expect(parseReward("Big rewards coming soon")).toMatchObject({ value: null, currency: null });
    expect(parseReward("Released in 2026 with 3 tracks")).toMatchObject({ value: null });
  });
  it("distinguishes reward certainty", () => {
    expect(detectRewardCertainty("giveaway", "winners randomly selected", true)).toBe("raffle");
    expect(detectRewardCertainty("hackathon", "prizes", true)).toBe("competition");
    expect(detectRewardCertainty("airdrop", "token airdrop", true)).toBe("unconfirmed");
    expect(detectRewardCertainty("grants", "no amount", false)).toBe("unknown");
  });
});

describe("risk", () => {
  it("flags seed phrase requests as high risk", () => {
    expect(assessRisk({ text: "Enter your seed phrase to claim", urls: ["https://x.io"] })).toEqual({
      level: "high",
      flags: ["asks_secret"],
    });
  });
  it("does not flag safety advice", () => {
    expect(assessRisk({ text: "Never share your seed phrase with anyone", urls: ["https://x.io"] }).level).toBe("low");
  });
  it("flags shorteners and http as medium", () => {
    expect(assessRisk({ text: "", urls: ["http://bit.ly/abc"] })).toMatchObject({ level: "medium" });
  });
});

describe("dedupe", () => {
  const existing: ExistingRef[] = [
    { id: "1", title: "Ethereum Academic Grants Round 2026", canonical_url: "https://blog.ethereum.org/en/2026/01/agr", source_provider: "ethereum_foundation_blog", external_id: "g-1", content_hash: "aaa", state: "published", review_state: "approved" },
  ];
  it("matches same source+external id first", () => {
    expect(findDuplicate({ sourceKey: "ethereum_foundation_blog", externalId: "g-1", canonicalUrl: "x", title: "z" }, existing)?.kind).toBe("same_source");
  });
  it("matches canonical url across sources", () => {
    expect(findDuplicate({ sourceKey: "other", externalId: "o", canonicalUrl: "https://blog.ethereum.org/en/2026/01/agr", title: "z" }, existing)?.kind).toBe("same_url");
  });
  it("matches very similar titles", () => {
    expect(titleSimilarity("Academic Grants Round 2026 — Ethereum", "Ethereum Academic Grants Round 2026")).toBe(1);
    expect(findDuplicate({ sourceKey: "o", externalId: "o", canonicalUrl: "u", title: "Ethereum Academic Grants Round 2026!" }, existing)?.kind).toBe("similar_title");
    expect(findDuplicate({ sourceKey: "o", externalId: "o", canonicalUrl: "u", title: "Solana Hackathon Breakpoint" }, existing)).toBeNull();
  });
});

describe("validation & publish decision", () => {
  it("computes deadline status", () => {
    const now = Date.parse("2026-11-25T00:00:00Z");
    expect(deadlineStatus("2026-11-24T00:00:00Z", now)).toBe("expired");
    expect(deadlineStatus("2026-12-24T00:00:00Z", now)).toBe("open");
    expect(deadlineStatus(null, now)).toBe("unknown");
    expect(isStale("2026-01-01T00:00:00Z", 60, now)).toBe(true);
  });
  const base = {
    sourceMode: "auto" as const,
    categoryMode: "auto" as const,
    trusted: true,
    riskLevel: "low" as const,
    completeness: 0.8,
    deadline: "open" as const,
    linkOk: true,
    possibleDuplicate: false,
  };
  it("auto-publishes only when every gate passes", () => {
    expect(decidePublish(base)).toEqual({ publish: true, reasons: [] });
    expect(decidePublish({ ...base, categoryMode: "manual" }).publish).toBe(false);
    expect(decidePublish({ ...base, riskLevel: "medium" }).publish).toBe(false);
    expect(decidePublish({ ...base, completeness: 0.4 }).publish).toBe(false);
    expect(decidePublish({ ...base, linkOk: false }).publish).toBe(false);
    expect(decidePublish({ ...base, deadline: "expired" }).publish).toBe(false);
    expect(decidePublish({ ...base, possibleDuplicate: true }).publish).toBe(false);
  });
});

describe("normalizeItem", () => {
  it("drops irrelevant news items for keyword-filtered feeds", () => {
    const out = normalizeItem({ externalId: "a", title: "Protocol upgrade recap", url: "https://blog.ethereum.org/a", description: "Notes." }, rssSource);
    expect(out).toEqual({ ok: false, reason: "irrelevant" });
  });
  it("normalizes a grants post with Indonesian summary and unknown fields", () => {
    const out = normalizeItem(
      {
        externalId: "b",
        title: "Announcing the 2027 Academic Grants Round",
        url: "https://blog.ethereum.org/en/2026/11/agr?utm_source=rss",
        description: "<p>We are allocating $2,000,000 to research on Ethereum and zero-knowledge proofs.</p>",
        organizer: "Ethereum Foundation",
      },
      rssSource,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    const c = out.candidate;
    expect(c.category).toBe("grants");
    expect(c.rewardValue).toBe(2_000_000);
    expect(c.rewardCertainty).toBe("competition");
    expect(c.deadlineAt).toBeNull();
    expect(c.missing).toContain("deadline");
    expect(c.summary).toContain("Grants dari Ethereum Foundation");
    expect(c.summary).toContain("Deadline belum diketahui");
    expect(c.canonicalUrl).toBe("https://blog.ethereum.org/en/2026/11/agr");
    expect(c.isFree).toBe(false);
    expect(c.riskLevel).toBe("low");
  });
  it("rejects items without a valid link", () => {
    expect(normalizeItem({ externalId: "c", title: "Grant program", url: "javascript:alert(1)" }, rssSource)).toEqual({ ok: false, reason: "invalid" });
  });
  it("uses job company as organizer for job feeds", () => {
    const out = normalizeItem(
      { externalId: "j", title: "ZK Researcher at Anagram", url: "https://cryptocurrencyjobs.co/research/x/" },
      { ...rssSource, key: "cryptocurrency_jobs", keyword_filter: false, default_category: "jobs", categories: ["jobs"], ecosystems: [] },
    );
    expect(out.ok && out.candidate.organizer).toBe("Anagram");
    expect(out.ok && out.candidate.category).toBe("jobs");
  });
});

describe("quota gate", () => {
  it("stops all requests once quota is exhausted", async () => {
    let remaining = 2;
    const consume = vi.fn(async () => remaining-- > 0);
    const gate = makeQuotaGate("x", consume);
    await gate.beforeRequest();
    await gate.beforeRequest();
    await expect(gate.beforeRequest()).rejects.toBeInstanceOf(QuotaExceededError);
    await expect(gate.beforeRequest()).rejects.toBeInstanceOf(QuotaExceededError);
    expect(consume).toHaveBeenCalledTimes(3);
    expect(gate.used).toBe(2);
    expect(gate.exhausted).toBe(true);
  });
  it("estimates zero cost for free sources", () => {
    expect(estimateCostUsd(500, 0)).toBe(0);
    expect(estimateCostUsd(1000, 5)).toBe(5);
  });
});

describe("risk negation edge cases", () => {
  it("still flags a real request after advice text", () => {
    expect(
      assessRisk({ text: "Never share your keys. To claim, enter your seed phrase below.", urls: ["https://x.io"] }).flags,
    ).toContain("asks_secret");
  });
  it("accepts Indonesian advice", () => {
    expect(assessRisk({ text: "Jangan pernah share your seed phrase", urls: ["https://x.io"] }).level).toBe("low");
  });
});

describe("relevance & reward context", () => {
  it("ignores numbers without prize context when context is required", () => {
    expect(parseReward("The protocol reached $2B TVL this year", { requireContext: true }).value).toBeNull();
    expect(parseReward("A prize pool of $50,000 is available", { requireContext: true }).value).toBe(50000);
  });
  it("drops winners/recap announcements", () => {
    const out = normalizeItem({ externalId: "w", title: "Announcing the Sui Overflow 2026 Hackathon Winners", url: "https://blog.sui.io/w" }, rssSource);
    expect(out).toEqual({ ok: false, reason: "irrelevant" });
  });
});
