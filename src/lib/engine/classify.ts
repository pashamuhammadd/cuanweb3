import type { OpportunityCategory, RewardCertainty } from "@/lib/supabase/database.types";

/**
 * Klasifikasi berbasis aturan (tanpa AI, biaya Rp0). Urutan menentukan
 * prioritas: kategori pertama yang cocok di JUDUL menang; bila judul tidak
 * cocok, deskripsi dipakai dengan syarat minimal dua kecocokan.
 */
const CATEGORY_RULES: Array<{ category: OpportunityCategory; patterns: RegExp[] }> = [
  {
    category: "hackathon",
    patterns: [/\bhackathons?\b/i, /\bbuildathons?\b/i, /\bhacker ?house\b/i, /\bhackers?\b.*\b(prize|track)s?\b/i],
  },
  {
    category: "grants",
    patterns: [
      /\bgrants?\b/i,
      /\bfunding (round|program|opportunit)/i,
      /\becosystem fund\b/i,
      /\bRFPs?\b/,
      /\brequest for proposals?\b/i,
      /\bwishlist\b/i,
      /\bacademic grants?\b/i,
      /\bpendanaan\b/i,
    ],
  },
  {
    category: "testnet",
    patterns: [/\b(incentivi[sz]ed )?testnet\b/i, /\bdevnet (campaign|program)\b/i],
  },
  {
    category: "ambassador",
    patterns: [/\bambassadors?\b/i, /\bcommunity (champions?|leads?) program\b/i, /\bfellowship\b/i],
  },
  {
    category: "bounty",
    patterns: [/\bbug bounty\b/i, /\bbount(y|ies)\b/i, /\bimmunefi\b/i],
  },
  {
    category: "contest",
    patterns: [/\bcontests?\b/i, /\bcompetitions?\b/i, /\bchallenge\b/i, /\bkontes\b/i, /\blomba\b/i],
  },
  {
    category: "airdrop",
    patterns: [/\bairdrops?\b/i, /\btoken (claim|distribution)\b/i, /\bretroactive\b/i],
  },
  {
    category: "giveaway",
    patterns: [/\bgiveaways?\b/i, /\bsweepstakes?\b/i, /\blucky draw\b/i],
  },
  {
    category: "paid_mission",
    patterns: [/\bpaid (mission|task|research|study|survey|testing)\b/i, /\buser testing\b/i, /\bbeta testers?\b/i],
  },
  {
    category: "jobs",
    patterns: [/\bwe'?re hiring\b/i, /\bjob (opening|opportunit)/i, /\bhiring\b/i, /\blowongan\b/i],
  },
];

export function detectCategory(
  title: string,
  description: string,
  allowed: readonly string[],
): { category: OpportunityCategory | null; matchedIn: "title" | "description" | null } {
  const isAllowed = (c: OpportunityCategory) => allowed.length === 0 || allowed.includes(c);

  for (const rule of CATEGORY_RULES) {
    if (!isAllowed(rule.category)) continue;
    if (rule.patterns.some((p) => p.test(title))) return { category: rule.category, matchedIn: "title" };
  }
  for (const rule of CATEGORY_RULES) {
    if (!isAllowed(rule.category)) continue;
    const hits = rule.patterns.reduce((n, p) => n + (description.match(new RegExp(p.source, "gi"))?.length ?? 0), 0);
    if (hits >= 2) return { category: rule.category, matchedIn: "description" };
  }
  return { category: null, matchedIn: null };
}

const ECOSYSTEM_RULES: Array<[string, RegExp]> = [
  ["solana", /\bsolana\b/i],
  ["ethereum", /\bethereum\b|\bEVM\b/i],
  ["base", /\bbase (chain|network|mainnet|ecosystem|builders?)\b|\bonchain summer\b|\bbase\.org\b/i],
  ["bnb-chain", /\bbnb ?chain\b|\bBSC\b|\bbinance smart chain\b/i],
  ["polygon", /\bpolygon\b/i],
  ["arbitrum", /\barbitrum\b/i],
  ["optimism", /\boptimism\b|\bsuperchain\b|\bOP stack\b/i],
  ["sui", /\bsui\b/i],
  ["aptos", /\baptos\b/i],
  ["cardano", /\bcardano\b|\bproject catalyst\b/i],
  ["avalanche", /\bavalanche\b|\bavax\b/i],
  ["near", /\bnear protocol\b/i],
  ["ton", /\bTON (blockchain|network|ecosystem)\b|\btelegram open network\b/i],
  ["cosmos", /\bcosmos\b/i],
  ["starknet", /\bstarknet\b/i],
  ["zksync", /\bzksync\b/i],
  ["bitcoin", /\bbitcoin\b|\bBTC\b/i],
];

export function detectEcosystems(text: string, defaults: readonly string[]): string[] {
  const found = new Set(defaults);
  for (const [name, pattern] of ECOSYSTEM_RULES) if (pattern.test(text)) found.add(name);
  return [...found];
}

const SKILL_RULES: Array<[string, RegExp]> = [
  ["solidity", /\bsolidity\b/i],
  ["rust", /\brust\b/i],
  ["move", /\bmove (language|developer|smart contract)s?\b|\bsui move\b|\baptos move\b/i],
  ["typescript", /\btypescript\b|\bjavascript\b|\bnode\.?js\b/i],
  ["frontend", /\bfront-?end\b|\breact\b|\bnext\.?js\b/i],
  ["backend", /\bback-?end\b|\bgolang\b|\bpython\b/i],
  ["smart-contract", /\bsmart contracts?\b/i],
  ["security", /\baudit(or|ing)?\b|\bsecurity research\b|\bbug bounty\b/i],
  ["zk", /\bzero[- ]knowledge\b|\bZK\b/],
  ["research", /\bresearch(er)?\b/i],
  ["design", /\bdesign(er)?\b|\bUI\/UX\b|\bfigma\b/i],
  ["writing", /\bwrit(ing|er)\b|\bcontent creat/i],
  ["video", /\bvideo\b/i],
  ["marketing", /\bmarketing\b|\bgrowth\b/i],
  ["community", /\bcommunity (manager|management|lead)\b|\bmoderator\b/i],
  ["data", /\bdata (analyst|science|engineer)\b|\banalytics\b/i],
];

export function detectSkills(text: string, extra: readonly string[] = []): string[] {
  const found = new Set(extra.map((t) => t.toLowerCase()).filter((t) => t.length <= 30));
  for (const [name, pattern] of SKILL_RULES) if (pattern.test(text)) found.add(name);
  return [...found].slice(0, 12);
}

export type ParsedReward = {
  value: number | null;
  currency: string | null;
  description: string | null;
  type: string | null;
};

const MULTIPLIERS: Record<string, number> = { k: 1e3, m: 1e6, million: 1e6, b: 1e9, billion: 1e9 };
const STABLE = new Set(["USDC", "USDT", "DAI", "PYUSD", "USDG"]);
const CRYPTO = new Set(["ETH", "SOL", "SUI", "APT", "ARB", "OP", "BNB", "MATIC", "POL", "ADA", "AVAX", "BTC"]);

function toNumber(num: string, mult?: string): number | null {
  const n = Number(num.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return mult ? n * (MULTIPLIERS[mult.toLowerCase()] ?? 1) : n;
}

/**
 * Ambil nominal hadiah HANYA bila tertulis eksplisit dengan mata uang. Tidak
 * pernah menebak. Nilai terbesar yang disebut dipakai sebagai "total" dan
 * kalimat aslinya disimpan di description agar admin dapat memeriksa.
 */
const REWARD_CONTEXT =
  /\b(prizes?|rewards?|grants?|bount(y|ies)|pool|fund(ing|s)?|awards?|allocat\w*|up to|payout|hadiah|stipend)\b/i;

/** Kata konteks hadiah dalam ±60 karakter dari nominal. */
function hasRewardContext(text: string, index: number, length: number): boolean {
  return REWARD_CONTEXT.test(text.slice(Math.max(0, index - 60), index + length + 60));
}

export function parseReward(
  text: string | null | undefined,
  options: { requireContext?: boolean } = {},
): ParsedReward {
  const empty: ParsedReward = { value: null, currency: null, description: null, type: null };
  if (!text) return empty;

  const candidates: Array<{ value: number; currency: string; raw: string }> = [];
  const accept = (index: number, raw: string) =>
    !options.requireContext || hasRewardContext(text, index, raw.length);

  const usd = /\$\s?(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s?(k|m|million|b|billion)?\b/gi;
  for (const m of text.matchAll(usd)) {
    const value = toNumber(m[1]!, m[2]);
    if (value && accept(m.index ?? 0, m[0])) candidates.push({ value, currency: "USD", raw: m[0] });
  }

  const coded = /\b(\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)\s?(k|m|million)?\s?(USDC|USDT|DAI|PYUSD|USDG|USD|ETH|SOL|SUI|APT|ARB|OP|BNB|POL|MATIC|ADA|AVAX|BTC)\b/g;
  for (const m of text.matchAll(coded)) {
    const value = toNumber(m[1]!, m[2]);
    if (value && accept(m.index ?? 0, m[0])) candidates.push({ value, currency: m[3]!, raw: m[0] });
  }

  if (candidates.length === 0) return empty;
  const best = candidates.reduce((a, b) => (b.value > a.value ? b : a));
  const type = STABLE.has(best.currency)
    ? "stablecoin"
    : CRYPTO.has(best.currency)
      ? "token"
      : "fiat";

  return {
    value: best.value,
    currency: best.currency,
    description: best.raw.trim(),
    type,
  };
}

export function detectRewardCertainty(
  category: OpportunityCategory,
  text: string,
  hasReward: boolean,
): RewardCertainty {
  if (/\b(raffle|lucky draw|random(ly)? (selected|chosen|drawn)|undian)\b/i.test(text)) return "raffle";
  if (category === "airdrop") return "unconfirmed";
  if (!hasReward) return "unknown";
  if (["hackathon", "contest", "bounty", "grants", "giveaway"].includes(category)) return "competition";
  if (category === "jobs" || category === "paid_mission") return "guaranteed";
  return "unconfirmed";
}

/** Info modal/biaya hanya bila sumber menyebut eksplisit. */
export function detectCostInfo(text: string): { costInfo: string | null; isFree: boolean | null } {
  if (/\b(no (fee|cost|deposit)|free to (join|apply|participate)|gratis|tanpa (modal|biaya))\b/i.test(text)) {
    return { costInfo: "Gratis menurut sumber resmi", isFree: true };
  }
  if (/\b(registration fee|entry fee|deposit required|stake (at least|minimum)|minimum (stake|deposit)|biaya pendaftaran)\b/i.test(text)) {
    return { costInfo: "Sumber menyebut adanya biaya/deposit — cek detail resmi", isFree: false };
  }
  return { costInfo: null, isFree: null };
}
