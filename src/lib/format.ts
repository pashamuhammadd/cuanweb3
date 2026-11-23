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
  if (!iso) return "Tanpa batas waktu";
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
