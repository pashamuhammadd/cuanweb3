const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

export function decodeEntities(input: string): string {
  // Beberapa feed meng-escape dua kali (&amp;amp;) — decode maksimal 2 putaran.
  let out = input;
  for (let i = 0; i < 2; i++) {
    const next = out.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
      if (code[0] === "#") {
        const n = code[1]?.toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : match;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? match;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return decodeEntities(
    input
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .trim();
}

export function cleanTitle(input: string): string {
  return decodeEntities(stripHtml(input)).replace(/\s+/g, " ").trim().slice(0, 200);
}

/** Potong pada batas kata. Dipakai untuk kutipan pendek sumber (bukan menyalin artikel). */
export function truncate(input: string, max: number): string {
  const text = input.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
}

/** FNV-1a 32-bit — cukup untuk deteksi perubahan konten, bukan kriptografi. */
export function hashContent(parts: Array<string | number | null | undefined>): string {
  const input = parts.map((p) => (p == null ? "" : String(p))).join("␟");
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function toIsoDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const t = Date.parse(input);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}
