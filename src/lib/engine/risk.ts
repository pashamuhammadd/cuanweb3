import type { RiskLevel } from "@/lib/supabase/database.types";
import { safeParseUrl } from "./url";

const SECRET_REQUEST =
  /\b(enter|submit|share|provide|input|verify|import|send)\s+(your\s+)?(wallet\s+)?(seed phrase|secret phrase|private key|recovery phrase|mnemonic)/gi;
const NEGATION_BEFORE =
  /\b(never|don'?t|do not|must not|should not|jangan|tidak pernah|no one will ask you to)\s+(\w+\s+){0,2}$/i;

/** Permintaan rahasia wallet — kecuali kalimat nasihat ("never share your seed phrase"). */
export function asksForSecret(text: string): boolean {
  for (const match of text.matchAll(SECRET_REQUEST)) {
    const start = match.index ?? 0;
    const before = text.slice(Math.max(0, start - 40), start);
    if (!NEGATION_BEFORE.test(before)) return true;
  }
  return false;
}

type Rule ={ flag: string; level: Exclude<RiskLevel, "low">; test: (ctx: RiskInput) => boolean };

export type RiskInput = { text: string; urls: string[] };

const SHORTENERS = /^(bit\.ly|t\.co|tinyurl\.com|cutt\.ly|is\.gd|rb\.gy|shorturl\.at|ow\.ly|t\.ly|s\.id)$/i;
const RISKY_TLDS = /\.(zip|mov|top|click|gq|cf|tk|ml|ga|work|rest)$/i;

export const RISK_FLAG_LABELS: Record<string, string> = {
  asks_secret: "Meminta seed phrase / private key",
  upfront_payment: "Meminta kirim dana/deposit untuk klaim",
  guaranteed_profit: "Menjanjikan keuntungan pasti",
  url_shortener: "Link memakai pemendek URL",
  insecure_link: "Link tidak memakai HTTPS",
  risky_tld: "Domain dengan TLD berisiko tinggi",
  claim_pressure: "Bahasa mendesak untuk klaim/connect wallet",
  invalid_link: "Link resmi tidak valid",
};

const RULES: Rule[] = [
  {
    flag: "asks_secret",
    level: "high",
    test: ({ text }) => asksForSecret(text),
  },
  {
    flag: "upfront_payment",
    level: "high",
    test: ({ text }) =>
      /\b(send|transfer|deposit)\s+\d+(\.\d+)?\s?(eth|sol|bnb|usdt|usdc|btc)\b.*\b(receive|claim|get back|double)\b/i.test(text) ||
      /\bpay (a |the )?(gas |small )?fee to (claim|unlock|receive)\b/i.test(text),
  },
  {
    flag: "guaranteed_profit",
    level: "high",
    test: ({ text }) => /\b(guaranteed (profit|returns?|income)|risk[- ]free (profit|returns?)|double your (crypto|money|eth|sol))\b/i.test(text),
  },
  {
    flag: "url_shortener",
    level: "medium",
    test: ({ urls }) => urls.some((u) => SHORTENERS.test(safeParseUrl(u)?.hostname ?? "")),
  },
  {
    flag: "insecure_link",
    level: "medium",
    test: ({ urls }) => urls.some((u) => safeParseUrl(u)?.protocol === "http:"),
  },
  {
    flag: "risky_tld",
    level: "medium",
    test: ({ urls }) => urls.some((u) => RISKY_TLDS.test(safeParseUrl(u)?.hostname ?? "")),
  },
  {
    flag: "claim_pressure",
    level: "medium",
    test: ({ text }) => /\b(claim (now|immediately|before it'?s gone)|connect (your )?wallet to claim|limited time claim)\b/i.test(text),
  },
  {
    flag: "invalid_link",
    level: "high",
    test: ({ urls }) => urls.length === 0 || urls.some((u) => !safeParseUrl(u)),
  },
];

export function assessRisk(input: RiskInput): { level: RiskLevel; flags: string[] } {
  const hits = RULES.filter((rule) => rule.test(input));
  const level: RiskLevel = hits.some((h) => h.level === "high")
    ? "high"
    : hits.length > 0
      ? "medium"
      : "low";
  return { level, flags: hits.map((h) => h.flag) };
}
