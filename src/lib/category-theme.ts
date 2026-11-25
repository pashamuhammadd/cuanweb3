import type { CSSProperties } from "react";
import type { OpportunityCategory } from "@/lib/supabase/database.types";

/**
 * Identitas visual per kategori, tetap di dalam palet CuanWeb3
 * (gold #F4BD35, teal #258C83, petrol #102B2B, offwhite #F5F5F5).
 */
type CategoryTheme = { from: string; to: string; fg: string };

const GOLD = "rgba(244, 189, 53, 0.42)";
const GOLD_SOFT = "rgba(244, 189, 53, 0.26)";
const TEAL = "rgba(37, 140, 131, 0.55)";
const TEAL_SOFT = "rgba(37, 140, 131, 0.35)";
const PETROL = "#123333";
const PETROL_DEEP = "#102b2b";
const OFFWHITE_SOFT = "rgba(245, 245, 245, 0.2)";

export const CATEGORY_THEME: Record<OpportunityCategory, CategoryTheme> = {
  airdrop: { from: GOLD, to: "rgba(244, 189, 53, 0.12)", fg: "#f4bd35" },
  giveaway: { from: GOLD, to: PETROL, fg: "#f4bd35" },
  bounty: { from: GOLD_SOFT, to: "rgba(37, 140, 131, 0.3)", fg: "#f4bd35" },
  contest: { from: GOLD_SOFT, to: "rgba(245, 245, 245, 0.08)", fg: "#f7cd61" },
  jobs: { from: OFFWHITE_SOFT, to: PETROL, fg: "#f5f5f5" },
  hackathon: { from: TEAL, to: "rgba(37, 140, 131, 0.18)", fg: "#4fc2b8" },
  grants: { from: GOLD_SOFT, to: PETROL_DEEP, fg: "#f4bd35" },
  testnet: { from: TEAL_SOFT, to: "rgba(245, 245, 245, 0.07)", fg: "#e6f4f3" },
  ambassador: { from: GOLD_SOFT, to: "rgba(37, 140, 131, 0.32)", fg: "#f4bd35" },
  paid_mission: { from: GOLD, to: PETROL_DEEP, fg: "#f4bd35" },
};

export function categoryStyle(category: OpportunityCategory): CSSProperties {
  const t = CATEGORY_THEME[category];
  return { "--cat-from": t.from, "--cat-to": t.to, "--cat-fg": t.fg } as CSSProperties;
}

/**
 * Ilustrasi kategori (WebP 256×256) yang SUDAH ada di
 * public/assets/icons/categories/<key>.webp. Tambahkan key ke daftar ini
 * setelah filenya ditaruh; selama belum ada, ikon Lucide dipakai sebagai
 * fallback (tanpa request 404).
 */
export const CATEGORY_ILLUSTRATIONS_READY: ReadonlySet<OpportunityCategory> = new Set<OpportunityCategory>([]);

export function categoryIllustration(category: OpportunityCategory): string | null {
  return CATEGORY_ILLUSTRATIONS_READY.has(category) ? `/assets/icons/categories/${category}.webp` : null;
}
