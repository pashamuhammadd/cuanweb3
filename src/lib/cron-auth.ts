import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Verifikasi header `Authorization: Bearer <CRON_SECRET>` secara timing-safe.
 * Menolak bila CRON_SECRET belum diset atau terlalu pendek (< 32 karakter).
 */
export function isAuthorizedCronRequest(authorization: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 32 || !authorization?.startsWith("Bearer ")) return false;
  const given = createHash("sha256").update(authorization.slice(7)).digest();
  const expected = createHash("sha256").update(secret).digest();
  return timingSafeEqual(given, expected);
}
