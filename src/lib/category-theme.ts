import type { OpportunityCategory } from "@/lib/supabase/database.types";

/**
 * Versi C (Charcoal & Gold): semua kategori memakai ikon garis gold yang sama
 * gayanya; pembeda kategori adalah ikon + label, bukan warna.
 * Aset: public/assets/icons/categories/<key>.webp (dari cuanweb3-redesign-c).
 */
export const CATEGORY_ILLUSTRATIONS_READY: ReadonlySet<OpportunityCategory> = new Set<OpportunityCategory>([
  "airdrop",
  "giveaway",
  "bounty",
  "contest",
  "jobs",
  "hackathon",
  "grants",
  "testnet",
  "ambassador",
  "paid_mission",
]);

export function categoryIllustration(category: OpportunityCategory): string | null {
  return CATEGORY_ILLUSTRATIONS_READY.has(category) ? `/assets/icons/categories/${category}.webp` : null;
}

/**
 * Thumbnail editorial DEKORATIF (hasil generasi, bukan foto penyelenggara)
 * dipakai hanya bila listing tidak punya gambar resmi. Jangan diberi alt yang
 * mengesankan afiliasi.
 */
const THUMBNAIL_FALLBACK: Record<OpportunityCategory, string> = {
  airdrop: "architecture",
  giveaway: "architecture",
  grants: "architecture",
  ambassador: "architecture",
  bounty: "workspace",
  contest: "workspace",
  jobs: "workspace",
  paid_mission: "workspace",
  hackathon: "innovation",
  testnet: "innovation",
};

export function categoryThumbnail(category: OpportunityCategory): string {
  return `/assets/thumbnails/${THUMBNAIL_FALLBACK[category]}.webp`;
}
