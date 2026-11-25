const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatUsd(value: number) {
  return usdFormatter.format(value);
}

export function formatIdr(value: number) {
  return idrFormatter.format(value);
}

export function formatPercent(value: number, options?: { withSign?: boolean }) {
  const sign = options?.withSign !== false && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatRelativeDeadline(iso: string | null) {
  if (!iso) return "Belum diketahui";
  const target = new Date(iso);
  const diffMs = target.getTime() - Date.now();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0) return "Sudah berakhir";
  if (diffDays <= 1) return "Berakhir hari ini";
  if (diffDays <= 14) return `${diffDays} hari lagi`;

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(target);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Tanggal + jam dalam WIB (Asia/Jakarta) untuk dashboard admin. */
export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
    timeZoneName: "short",
  }).format(new Date(iso));
}

export function isFutureDate(iso: string | null | undefined): boolean {
  return Boolean(iso) && Date.parse(iso!) > Date.now();
}

/**
 * Rapikan tanda pisah panjang (— / –) pada teks tampilan menjadi koma.
 * Data asli di database tidak diubah (hash konten engine tetap stabil).
 * Rentang angka seperti "1–5" dipertahankan.
 */
export function tidyDashes<T extends string | null | undefined>(text: T): T {
  if (!text) return text;
  return text.replace(/\s+[—–]\s+/g, ", ").replace(/\s*—\s*/g, ", ") as T;
}
