import { QuotaExceededError } from "./types";

export type ConsumeQuota = (amount: number) => Promise<boolean>;

/**
 * Gerbang kuota: dipanggil sebelum setiap request keluar. Setelah sekali
 * ditolak, semua request berikutnya langsung ditolak tanpa memanggil DB lagi
 * (penghentian otomatis ketika kuota gratis habis).
 */
export function makeQuotaGate(sourceKey: string, consume: ConsumeQuota) {
  let exhausted = false;
  let used = 0;
  return {
    async beforeRequest() {
      if (exhausted) throw new QuotaExceededError(sourceKey);
      const ok = await consume(1);
      if (!ok) {
        exhausted = true;
        throw new QuotaExceededError(sourceKey);
      }
      used++;
    },
    get used() {
      return used;
    },
    get exhausted() {
      return exhausted;
    },
  };
}

/** Estimasi biaya (USD) — untuk sumber gratis selalu 0. */
export function estimateCostUsd(requests: number, costPer1k: number): number {
  return Math.round(((requests / 1000) * costPer1k) * 100) / 100;
}
