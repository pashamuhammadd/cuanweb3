import type { RiskLevel } from "@/lib/supabase/database.types";

export const FIELD_LABELS: Record<string, string> = {
  organizer: "Penyelenggara",
  deadline: "Deadline",
  reward: "Hadiah/kompensasi",
  officialLink: "Link resmi",
  description: "Deskripsi sumber",
};

export function assessCompleteness(input: {
  organizer: string | null;
  deadlineAt: string | null;
  rewardValue: number | null;
  externalUrl: string | null;
  description: string;
}): { missing: string[]; score: number } {
  const checks: Array<[string, boolean]> = [
    ["organizer", Boolean(input.organizer)],
    ["deadline", Boolean(input.deadlineAt)],
    ["reward", input.rewardValue != null],
    ["officialLink", Boolean(input.externalUrl)],
    ["description", input.description.trim().length >= 40],
  ];
  const missing = checks.filter(([, ok]) => !ok).map(([k]) => k);
  return { missing, score: (checks.length - missing.length) / checks.length };
}

export type DeadlineStatus = "unknown" | "open" | "expired";

export function deadlineStatus(deadlineAt: string | null, now = Date.now()): DeadlineStatus {
  if (!deadlineAt) return "unknown";
  const t = Date.parse(deadlineAt);
  if (!Number.isFinite(t)) return "unknown";
  return t < now ? "expired" : "open";
}

/** Peluang berita (RSS) yang tidak punya tanggal dianggap basi setelah N hari. */
export function isStale(publishedAt: string | null | undefined, maxAgeDays: number, now = Date.now()): boolean {
  if (!publishedAt) return false;
  const t = Date.parse(publishedAt);
  return Number.isFinite(t) && now - t > maxAgeDays * 86_400_000;
}

export type PublishDecision = { publish: boolean; reasons: string[] };

export const MIN_AUTO_PUBLISH_COMPLETENESS = 0.6;

/**
 * Auto-publish hanya bila SEMUA syarat terpenuhi. Default selalu manual.
 * Alasan dikembalikan untuk ditampilkan di Review Queue.
 */
export function decidePublish(input: {
  sourceMode: "manual" | "auto";
  categoryMode: "manual" | "auto";
  trusted: boolean;
  riskLevel: RiskLevel;
  completeness: number;
  deadline: DeadlineStatus;
  linkOk: boolean | null;
  possibleDuplicate: boolean;
}): PublishDecision {
  const reasons: string[] = [];
  if (input.sourceMode !== "auto") reasons.push("Sumber memakai mode manual");
  if (input.categoryMode !== "auto") reasons.push("Kategori memakai mode manual");
  if (!input.trusted) reasons.push("Sumber belum ditandai tepercaya");
  if (input.riskLevel !== "low") reasons.push(`Risiko ${input.riskLevel === "high" ? "tinggi" : "sedang"}`);
  if (input.completeness < MIN_AUTO_PUBLISH_COMPLETENESS) reasons.push("Informasi belum cukup lengkap");
  if (input.deadline === "expired") reasons.push("Deadline sudah lewat");
  if (input.linkOk === false) reasons.push("Link resmi tidak dapat diakses");
  if (input.linkOk === null && input.sourceMode === "auto") reasons.push("Link resmi belum dicek");
  if (input.possibleDuplicate) reasons.push("Kemungkinan duplikat");
  return { publish: reasons.length === 0, reasons };
}
