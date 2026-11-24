const STOPWORDS = new Set([
  "the", "a", "an", "of", "and", "for", "to", "in", "on", "at", "with", "is", "are", "by", "our", "your",
  "announcing", "announces", "introducing", "new", "now", "open", "opens", "live", "2024", "2025", "2026", "2027",
  "dan", "untuk", "di", "ke", "dari", "yang",
]);

export function normalizeTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokens(title: string): Set<string> {
  return new Set(
    normalizeTitle(title)
      .split(" ")
      .filter((t) => t.length > 1 && !STOPWORDS.has(t)),
  );
}

/** Kemiripan Jaccard token judul (0–1). */
export function titleSimilarity(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

export type ExistingRef = {
  id: string;
  title: string;
  canonical_url: string | null;
  source_provider: string | null;
  external_id: string | null;
  content_hash: string | null;
  state: string;
  review_state: string;
};

export type DuplicateMatch =
  | { kind: "same_source"; existing: ExistingRef }
  | { kind: "same_url"; existing: ExistingRef }
  | { kind: "similar_title"; existing: ExistingRef; score: number };

export const TITLE_DUPLICATE_THRESHOLD = 0.8;

/**
 * Urutan prioritas: (1) source+external_id sama → item yang sama (update),
 * (2) URL kanonik sama → duplikat lintas sumber (lewati),
 * (3) judul sangat mirip → kemungkinan duplikat (tetap masuk review, ditandai).
 */
export function findDuplicate(
  candidate: { sourceKey: string; externalId: string; canonicalUrl: string; title: string },
  existing: readonly ExistingRef[],
): DuplicateMatch | null {
  const same = existing.find(
    (e) => e.source_provider === candidate.sourceKey && e.external_id === candidate.externalId,
  );
  if (same) return { kind: "same_source", existing: same };

  const sameUrl = existing.find((e) => e.canonical_url && e.canonical_url === candidate.canonicalUrl);
  if (sameUrl) return { kind: "same_url", existing: sameUrl };

  let best: { existing: ExistingRef; score: number } | null = null;
  for (const e of existing) {
    const score = titleSimilarity(candidate.title, e.title);
    if (score >= TITLE_DUPLICATE_THRESHOLD && (!best || score > best.score)) best = { existing: e, score };
  }
  return best ? { kind: "similar_title", ...best } : null;
}
