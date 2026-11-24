/**
 * Validasi path redirect pasca-login agar tidak bisa dipakai sebagai open
 * redirect (mis. `//evil.com`, `/\evil.com`, `@evil.com`, `https://evil.com`).
 * Hanya menerima path relatif internal yang diawali satu "/".
 */
export function safeRedirectPath(
  value: string | null | undefined,
  fallback = "/akun",
): string {
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  // Tolak karakter kontrol/whitespace yang bisa dinormalisasi browser.
  if (/[\u0000-\u001f\u007f\s\\]/.test(value)) return fallback;

  try {
    const base = "https://internal.invalid";
    const url = new URL(value, base);
    if (url.origin !== base) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
