import { fetchWithRetry } from "../http";
import { ConfigError, type RawItem, type SourceAdapter } from "../types";

type Web3CareerJob = {
  id?: number | string;
  title?: string;
  company?: string;
  url?: string;
  apply_url?: string;
  salary?: string | null;
  tags?: string[];
  remote?: boolean;
  location?: string | null;
  country?: string | null;
  city?: string | null;
  date?: string | null;
  date_epoch?: number | null;
  description?: string | null;
};

/**
 * Respons API berbentuk array campuran: biasanya dua string lalu array job.
 * Ambil array pertama yang berisi objek. Diekspor untuk unit test.
 */
export function extractJobs(payload: unknown): Web3CareerJob[] {
  if (!Array.isArray(payload)) return [];
  const nested = payload.find((p) => Array.isArray(p)) as unknown[] | undefined;
  const list = nested ?? payload;
  return list.filter((j): j is Web3CareerJob => typeof j === "object" && j !== null && "title" in j);
}

export function mapWeb3CareerJob(job: Web3CareerJob): RawItem | null {
  if (!job.title || !(job.apply_url || job.url)) return null;
  const location = [job.city, job.country, job.location].filter(Boolean).join(", ") || null;
  return {
    externalId: String(job.id ?? job.apply_url ?? job.url),
    title: job.title,
    url: job.url ?? job.apply_url!,
    // Syarat API: link-back WAJIB memakai apply_url apa adanya (tanpa UTM, follow).
    applyUrl: job.apply_url ?? null,
    organizer: job.company ?? null,
    publishedAt: job.date_epoch ? new Date(job.date_epoch * 1000).toISOString() : (job.date ?? null),
    description: job.description ?? null,
    rewardText: job.salary ?? null,
    location,
    remote: job.remote ?? null,
    tags: job.tags ?? [],
    categoryHint: "jobs",
  };
}

export const web3CareerAdapter: SourceAdapter = {
  key: "web3career",
  async fetchItems(source, ctx) {
    const envName = source.api_key_env ?? "WEB3_CAREER_API_TOKEN";
    const token = ctx.env[envName];
    if (!token) throw new ConfigError(`Token belum dikonfigurasi: isi env server ${envName}.`);

    const url = new URL(source.url);
    url.searchParams.set("token", token);
    url.searchParams.set("limit", "50");
    url.searchParams.set("show_description", "false");

    let requests = 0;
    const res = await fetchWithRetry(url.toString(), {
      deadline: ctx.deadline,
      fetchImpl: ctx.fetchImpl,
      headers: { Accept: "application/json" },
      beforeRequest: async () => {
        requests++;
        await ctx.beforeRequest();
      },
    });
    const items = extractJobs(await res.json())
      .map(mapWeb3CareerJob)
      .filter((i): i is RawItem => i !== null);
    return { items, requests };
  },
};
