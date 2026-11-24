const TRACKING_PARAMS = /^(utm_[a-z]+|ref|ref_src|source|fbclid|gclid|mc_cid|mc_eid|_hsenc|_hsmi|mkt_tok)$/i;

export function safeParseUrl(input: string | null | undefined): URL | null {
  if (!input) return null;
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url;
  } catch {
    return null;
  }
}

/**
 * URL kanonik untuk deduplikasi: host lowercase tanpa "www.", tanpa hash,
 * tanpa parameter tracking, tanpa trailing slash, parameter diurutkan.
 */
export function canonicalUrl(input: string): string {
  const url = safeParseUrl(input);
  if (!url) return input.trim().toLowerCase();
  const params = [...url.searchParams.entries()]
    .filter(([key]) => !TRACKING_PARAMS.test(key))
    .sort(([a], [b]) => a.localeCompare(b));
  const query = params.length
    ? `?${params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&")}`
    : "";
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const path = url.pathname.replace(/\/+$/, "") || "";
  return `https://${host}${path}${query}`;
}

export function hostnameOf(input: string | null | undefined): string | null {
  return safeParseUrl(input)?.hostname.toLowerCase().replace(/^www\./, "") ?? null;
}
