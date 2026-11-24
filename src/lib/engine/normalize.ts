import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { OPPORTUNITY_CATEGORIES } from "@/lib/supabase/database.types";
import {
  detectCategory,
  detectCostInfo,
  detectEcosystems,
  detectRewardCertainty,
  detectSkills,
  parseReward,
} from "./classify";
import { assessRisk } from "./risk";
import { buildContent, buildSummary } from "./summarize";
import { cleanTitle, hashContent, stripHtml, toIsoDate, truncate } from "./text";
import type { NormalizedCandidate, RawItem, SourceConfig } from "./types";
import { canonicalUrl, safeParseUrl } from "./url";
import { assessCompleteness } from "./validate";

export type NormalizeOutcome =
  | { ok: true; candidate: NormalizedCandidate }
  | { ok: false; reason: "irrelevant" | "invalid" };

const SOURCE_EXCERPT_MAX = 280;
const LEAD_CHARS = 1200;

/** Judul pengumuman hasil/rekap — bukan peluang yang masih bisa diikuti. */
export const NOT_OPEN_OPPORTUNITY =
  /\b(winners?|recap|results|highlights|wrap[- ]?up|retrospective|in review|post[- ]?mortem|meet the|celebrating|year in review|cohort (announced|revealed))\b/i;

function isCategory(value: string | null | undefined): value is OpportunityCategory {
  return Boolean(value) && (OPPORTUNITY_CATEGORIES as readonly string[]).includes(value!);
}

export function normalizeItem(raw: RawItem, source: SourceConfig): NormalizeOutcome {
  const title = cleanTitle(raw.title ?? "");
  const officialUrl = raw.applyUrl ?? raw.url;
  if (!title || title.length < 4 || !safeParseUrl(raw.url) || !safeParseUrl(officialUrl)) {
    return { ok: false, reason: "invalid" };
  }

  const description = stripHtml(raw.description);
  // Analisis hanya judul + awal artikel: artikel blog panjang menyebut banyak
  // hal sekilas (ekosistem lain, kata "testnet") yang bukan inti peluang.
  const lead = description.slice(0, LEAD_CHARS);
  const text = `${title}\n${lead}\n${(raw.tags ?? []).join(" ")}`;

  if (!raw.categoryHint && NOT_OPEN_OPPORTUNITY.test(title)) return { ok: false, reason: "irrelevant" };

  let category: OpportunityCategory | null = raw.categoryHint ?? null;
  if (!category) {
    const detected = detectCategory(title, lead, source.categories);
    category = detected.category;
    if (!category) {
      if (source.keyword_filter) return { ok: false, reason: "irrelevant" };
      category = isCategory(source.default_category) ? source.default_category : null;
    }
  }
  if (!category) return { ok: false, reason: "irrelevant" };

  const reward = raw.rewardText
    ? parseReward(raw.rewardText)
    : category === "jobs"
      ? parseReward(null)
      : parseReward(`${title}\n${lead}`, { requireContext: true });
  const certainty = detectRewardCertainty(category, text, reward.value != null);
  const cost = detectCostInfo(text);
  const ecosystems = detectEcosystems(text, source.ecosystems);
  const skills = detectSkills(text, category === "jobs" ? (raw.tags ?? []) : []);
  const deadlineAt = toIsoDate(raw.deadlineAt);
  const startsAt = toIsoDate(raw.startsAt);
  // Judul lowongan "Posisi at Perusahaan" → perusahaan sebagai penyelenggara.
  const jobCompany = category === "jobs" ? / at ([^|–—]{2,60})$/.exec(title)?.[1]?.trim() : undefined;
  const organizer = raw.organizer?.trim() || jobCompany || null;
  const location = raw.location?.trim() || null;

  const summaryInput = {
    category,
    title,
    organizer,
    ecosystems,
    rewardValue: reward.value,
    rewardCurrency: reward.currency,
    rewardCertainty: certainty,
    deadlineAt,
    location,
    remote: raw.remote ?? null,
    skills,
    sourceName: source.name,
  };

  const risk = assessRisk({ text, urls: [raw.url, officialUrl] });
  const completeness = assessCompleteness({
    organizer,
    deadlineAt,
    rewardValue: reward.value,
    externalUrl: officialUrl,
    description,
  });

  return {
    ok: true,
    candidate: {
      externalId: raw.externalId,
      title,
      organizer,
      category,
      ecosystems,
      skills,
      tags: [...new Set([...ecosystems, ...skills])].slice(0, 12),
      summary: buildSummary(summaryInput),
      content: buildContent({ ...summaryInput, requirements: [], costInfo: cost.costInfo }),
      sourceExcerpt: description ? truncate(description, SOURCE_EXCERPT_MAX) : null,
      rewardValue: reward.value,
      rewardCurrency: reward.currency,
      rewardDescription: reward.description,
      rewardType: reward.type,
      rewardCertainty: certainty,
      deadlineAt,
      startsAt,
      requirements: [],
      costInfo: cost.costInfo,
      // Default "tanpa modal" hanya bila sumber menyatakan gratis; selain itu
      // dianggap belum diketahui (false agar tidak muncul di filter "Tanpa modal").
      isFree: cost.isFree === true,
      country: location,
      externalUrl: officialUrl,
      sourceUrl: raw.url,
      canonicalUrl: canonicalUrl(raw.url),
      contentHash: hashContent([title, description, raw.deadlineAt, raw.rewardText, officialUrl]),
      riskLevel: risk.level,
      riskFlags: risk.flags,
      missing: completeness.missing,
      completeness: completeness.score,
    },
  };
}
