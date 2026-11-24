export const USER_AGENT = "CuanWeb3-OpportunityBot/1.0 (+https://cuanweb3.com/tentang)";

export class HttpError extends Error {
  constructor(
    public status: number,
    public url: string,
  ) {
    super(`HTTP ${status} dari ${new URL(url).hostname}`);
    this.name = "HttpError";
  }
}

export type FetchOptions = {
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  deadline: number;
  /** Dipanggil sebelum SETIAP percobaan (termasuk retry) — untuk penghitungan kuota. */
  beforeRequest?: () => Promise<void>;
  fetchImpl?: typeof fetch;
  method?: "GET" | "HEAD";
  /** Status yang dikembalikan apa adanya, tidak dianggap error (mis. 304). */
  acceptStatus?: number[];
};

const RETRYABLE = new Set([408, 425, 429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function backoffDelay(attempt: number, retryAfterHeader?: string | null): number {
  const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : NaN;
  if (Number.isFinite(retryAfter) && retryAfter >= 0) return Math.min(retryAfter * 1000, 10_000);
  const base = Math.min(1000 * 2 ** attempt, 8_000);
  return Math.round(base * (0.8 + Math.random() * 0.4));
}

/**
 * fetch dengan timeout, retry + exponential backoff (jitter) untuk 429/5xx/
 * error jaringan, dan batas waktu absolut agar cron tidak melewati maxDuration.
 * 4xx lain (401/403/404) tidak di-retry.
 */
export async function fetchWithRetry(url: string, options: FetchOptions): Promise<Response> {
  const { retries = 2, timeoutMs = 12_000, fetchImpl = fetch } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const remaining = options.deadline - Date.now();
    if (remaining < 1500) throw new Error("Batas waktu sinkronisasi tercapai sebelum request selesai.");

    await options.beforeRequest?.();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), Math.min(timeoutMs, remaining - 500));
    try {
      const res = await fetchImpl(url, {
        method: options.method ?? "GET",
        headers: { "User-Agent": USER_AGENT, ...options.headers },
        signal: controller.signal,
        redirect: "follow",
        cache: "no-store",
      });
      if (res.ok || options.acceptStatus?.includes(res.status)) return res;
      if (!RETRYABLE.has(res.status) || attempt === retries) throw new HttpError(res.status, url);
      lastError = new HttpError(res.status, url);
      await sleep(Math.min(backoffDelay(attempt, res.headers.get("retry-after")), options.deadline - Date.now() - 1000));
    } catch (error) {
      if (error instanceof HttpError && !RETRYABLE.has(error.status)) throw error;
      if (error instanceof Error && error.name === "QuotaExceededError") throw error;
      lastError = error;
      if (attempt === retries) break;
      await sleep(Math.max(0, Math.min(backoffDelay(attempt), options.deadline - Date.now() - 1000)));
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Request gagal.");
}
