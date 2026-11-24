import type { RiskLevel } from "@/lib/supabase/database.types";

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

/**
 * Auto-publish hanya bila SEMUA syarat terpenuhi. Default selalu manual.
 * Alasan dikembalikan untuk ditampilkan di Review Queue.
 */
export function decidePublish(input: {
  sourceMode: "manual" | "auto";
  categoryMode: "manual" | "auto";
  trusted: boolean;
  riskLevel: RiskLevel;
  /** Label field wajib kategori yang belum terisi. */
  missingRequired: string[];
  deadline: DeadlineStatus;
  linkOk: boolean | null;
  possibleDuplicate: boolean;
}): PublishDecision {
  const reasons: string[] = [];
  if (input.sourceMode !== "auto") reasons.push("Sumber memakai mode manual");
  if (input.categoryMode !== "auto") reasons.push("Kategori memakai mode manual");
  if (!input.trusted) reasons.push("Sumber belum ditandai tepercaya");
  if (input.riskLevel !== "low") reasons.push(`Risiko ${input.riskLevel === "high" ? "tinggi" : "sedang"}`);
  if (input.missingRequired.length > 0) reasons.push(`Field wajib belum lengkap: ${input.missingRequired.join(", ")}`);
  if (input.deadline === "expired") reasons.push("Deadline sudah lewat");
  if (input.linkOk === false) reasons.push("Link resmi tidak dapat diakses");
  if (input.linkOk === null && input.sourceMode === "auto") reasons.push("Link resmi belum dicek");
  if (input.possibleDuplicate) reasons.push("Kemungkinan duplikat");
  return { publish: reasons.length === 0, reasons };
}
