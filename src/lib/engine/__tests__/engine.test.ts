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
    missingRequired: [] as string[],
    deadline: "open" as const,
    linkOk: true,
    possibleDuplicate: false,
  };
  it("auto-publishes only when every gate passes", () => {
    expect(decidePublish(base)).toEqual({ publish: true, reasons: [] });
    expect(decidePublish({ ...base, categoryMode: "manual" }).publish).toBe(false);
    expect(decidePublish({ ...base, riskLevel: "medium" }).publish).toBe(false);
    expect(decidePublish({ ...base, missingRequired: ["Gaji"] }).publish).toBe(false);
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
    expect(c.missing).toEqual([]);
    expect(c.missingRecommended).toContain("deadline");
    expect(c.details.funding_type).toBe("research");
    expect(c.summary).toContain("Grants dari Ethereum Foundation");
    expect(c.summary).toContain("Nilai pendanaan: US$2.000.000");
    expect(c.summary).toContain("Batas pengajuan: belum diketahui");
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

describe("category-specific details (jobs)", () => {
  const jobsSource = { ...rssSource, key: "cryptocurrency_jobs", name: "Cryptocurrency Jobs", keyword_filter: false, default_category: "jobs" as const, categories: ["jobs"], ecosystems: [] };
  it("extracts employment type, work mode, level, function and location", () => {
    const out = normalizeItem(
      {
        externalId: "j1",
        title: "Staff Backend Engineer at Superstate",
        url: "https://cryptocurrencyjobs.co/engineering/superstate-staff-backend-engineer/",
        description: "Superstate is looking to hire a Staff Backend Engineer to join their team. This is a full-time position that is 100% remote with no geographical restrictions. Work remotely from anywhere.",
      },
      jobsSource,
    );
    expect(out.ok).toBe(true);
    if (!out.ok) return;
    expect(out.candidate.details).toEqual({ employment_type: "full_time", work_mode: "remote", experience_level: "lead", job_function: "Engineering" });
    expect(out.candidate.country).toBe("Global — bisa dari mana saja");
    expect(out.candidate.missing).toEqual([]);
    expect(out.candidate.missingRecommended).toEqual(["reward"]);
    expect(out.candidate.summary).toBe("Lowongan kerja Web3 di Superstate (Full-time · Remote · Lead / Staff / Principal). Lokasi kerja: Global — bisa dari mana saja. Gaji: belum diketahui.");
  });
  it("captures regional remote restrictions and does not guess level", () => {
    const out = normalizeItem(
      {
        externalId: "j2",
        title: "Strategic Account Manager at Sardine",
        url: "https://cryptocurrencyjobs.co/sales/sardine-strategic-account-manager/",
        description: "Sardine is looking to hire a Strategic Account Manager to join their team. This is a full-time position that can be done remotely anywhere in the United States, or Canada.",
      },
      jobsSource,
    );
    if (!out.ok) throw new Error("expected ok");
    expect(out.candidate.country).toBe("Remote: United States, Canada");
    expect(out.candidate.details.experience_level).toBeUndefined();
    expect(out.candidate.details.job_function).toBe("Sales");
  });
  it("blocks auto-publish when a required job field is missing", () => {
    const out = normalizeItem({ externalId: "j3", title: "Engineer at Acme", url: "https://cryptocurrencyjobs.co/engineering/x/", description: "Join us." }, jobsSource);
    if (!out.ok) throw new Error("expected ok");
    expect(out.candidate.missing).toEqual(["details.employment_type", "details.work_mode", "location"]);
  });
});

describe("category-specific details (other categories)", () => {
  it("extracts testnet network from the title", () => {
    const out = normalizeItem({ externalId: "t", title: "Glamsterdam Hoodi Testnet Announcement", url: "https://blog.ethereum.org/t", organizer: "Ethereum Foundation" }, rssSource);
    if (!out.ok) throw new Error("expected ok");
    expect(out.candidate.category).toBe("testnet");
    expect(out.candidate.details.network).toBe("Hoodi");
    expect(out.candidate.missing).toEqual([]);
  });
});

describe("testnet network guard", () => {
  it("does not treat a month as a network name", () => {
    const out = normalizeItem({ externalId: "m", title: "Partners Join Coalition Ahead of July Global Testnet", url: "https://blog.sui.io/m", organizer: "Sui" }, { ...rssSource, ecosystems: ["sui"] });
    if (!out.ok) throw new Error("expected ok");
    expect(out.candidate.details.network).toBeUndefined();
    expect(out.candidate.missing).toContain("details.network");
  });
});

describe("on-site jobs", () => {
  it("treats 'based in' without remote as on-site and keeps the city", () => {
    const out = normalizeItem(
      { externalId: "o", title: "Options Trader at Wintermute", url: "https://cryptocurrencyjobs.co/trading/x/", description: "Wintermute is looking to hire an Options Trader to join their team. This is a full-time position that can be based in London, or New York NY." },
      { ...rssSource, key: "cryptocurrency_jobs", keyword_filter: false, default_category: "jobs", categories: ["jobs"], ecosystems: [] },
    );
    if (!out.ok) throw new Error("expected ok");
    expect(out.candidate.details.work_mode).toBe("onsite");
    expect(out.candidate.country).toBe("London, New York NY");
    expect(out.candidate.missing).toEqual([]);
  });
});
