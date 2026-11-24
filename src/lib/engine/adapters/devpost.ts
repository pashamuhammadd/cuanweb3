import { fetchWithRetry } from "../http";
import { stripHtml } from "../text";
import type { RawItem, SourceAdapter } from "../types";

type DevpostHackathon = {
  id?: number;
  title?: string;
  url?: string;
  organization_name?: string | null;
  submission_period_dates?: string | null;
  prize_amount?: string | null;
  themes?: Array<{ name?: string }>;
  open_state?: string;
  invite_only?: boolean;
  displayed_location?: { location?: string | null } | null;
};

const WEB3_THEME = /\b(blockchain|web3|crypto|cryptocurrency|defi|nft|dao|smart contract)s?\b/i;
const SEARCH_TERMS = ["web3", "blockchain", "crypto"];

/**
 * "Nov 11, 2026 - Jan 11, 2027" atau "Nov 11 - Dec 15, 2026" → {start, end}.
 * Tahun yang hilang di bagian awal diambil dari bagian akhir. Diekspor untuk test.
 */
export function parseDevpostPeriod(input: string | null | undefined): { start: string | null; end: string | null } {
  if (!input) return { start: null, end: null };
  const [rawStart, rawEnd] = input.split(/\s+-\s+/);
  if (!rawStart || !rawEnd) return { start: null, end: null };
  const endYear = /\b(\d{4})\b/.exec(rawEnd)?.[1];
  let endText = rawEnd.trim();
  // "Nov 11 - 15, 2026" → bulan akhir sama dengan bulan awal.
  if (/^\d{1,2},/.test(endText)) endText = `${rawStart.trim().split(" ")[0]} ${endText}`;
  const startText = /\b\d{4}\b/.test(rawStart) ? rawStart : `${rawStart}, ${endYear ?? ""}`;
  const start = Date.parse(`${startText} 00:00 UTC`);
  const end = Date.parse(`${endText} 23:59 UTC`);
  return {
    start: Number.isFinite(start) ? new Date(start).toISOString() : null,
    end: Number.isFinite(end) ? new Date(end).toISOString() : null,
  };
}

export function mapDevpostHackathon(h: DevpostHackathon): RawItem | null {
  if (!h.title || !h.url || h.invite_only) return null;
  const themes = (h.themes ?? []).map((t) => t.name ?? "").filter(Boolean);
  if (!themes.some((t) => WEB3_THEME.test(t)) && !WEB3_THEME.test(h.title)) return null;
  const period = parseDevpostPeriod(h.submission_period_dates);
  return {
    externalId: String(h.id ?? h.url),
    title: h.title,
    url: h.url,
    organizer: h.organization_name ?? null,
    startsAt: period.start,
    deadlineAt: period.end,
    // Tag inline dihapus tanpa spasi agar "$<span>10,000</span>" → "$10,000".
    rewardText: h.prize_amount ? stripHtml(h.prize_amount.replace(/<[^>]+>/g, "")) : null,
    location: h.displayed_location?.location ?? null,
    description: `Themes: ${themes.join(", ")}`,
    tags: themes,
    categoryHint: "hackathon",
  };
}

/** Nonaktif secara default: endpoint tidak terdokumentasi, izin belum diverifikasi pemilik. */
export const devpostAdapter: SourceAdapter = {
  key: "devpost",
  async fetchItems(source, ctx) {
    let requests = 0;
    const seen = new Map<string, RawItem>();
    for (const term of SEARCH_TERMS) {
      const url = new URL(source.url);
      url.searchParams.set("search", term);
      url.searchParams.append("status[]", "open");
      const res = await fetchWithRetry(url.toString(), {
        deadline: ctx.deadline,
        fetchImpl: ctx.fetchImpl,
        headers: { Accept: "application/json" },
        beforeRequest: async () => {
          requests++;
          await ctx.beforeRequest();
        },
      });
      const body = (await res.json()) as { hackathons?: DevpostHackathon[] };
      for (const h of body.hackathons ?? []) {
        const item = mapDevpostHackathon(h);
        if (item) seen.set(item.externalId, item);
      }
    }
    return { items: [...seen.values()], requests };
  },
};
