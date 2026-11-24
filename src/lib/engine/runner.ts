import "server-only";
import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Database,
  ImportRunStatus,
  IntegrationSourceRow,
  OpportunityCategory,
  OpportunityRow,
} from "@/lib/supabase/database.types";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { requirementLabel } from "@/lib/category-specs";
import { getAdapter } from "./adapters";
import { findDuplicate, type ExistingRef } from "./dedupe";
import { fetchWithRetry } from "./http";
import { normalizeItem } from "./normalize";
import { makeQuotaGate } from "./quota";
import { hashContent, slugify } from "./text";
import { ConfigError, QuotaExceededError, type NormalizedCandidate, type RawItem, type SourceConfig } from "./types";
import { decidePublish, deadlineStatus, isStale } from "./validate";

type Client = SupabaseClient<Database>;
export type SyncTrigger = "cron" | "manual" | "test";

export type RunSummary = {
  sourceKey: string;
  sourceName: string;
  status: ImportRunStatus;
  found: number;
  created: number;
  updated: number;
  published: number;
  queued: number;
  duplicates: number;
  skipped: number;
  errors: number;
  requests: number;
  message: string | null;
};

export type SyncResult = {
  status: "ok" | "locked" | "disabled" | "not_configured";
  expired: number;
  runs: RunSummary[];
  pendingSources: string[];
};

const LOCK_NAME = "opportunity_sync";
const DEFAULT_BUDGET_MS = 50_000;
const PER_SOURCE_MAX_MS = 25_000;
/** Item berita tanpa deadline yang lebih tua dari ini tidak diimpor. */
const MAX_NEWS_AGE_DAYS = 45;
const RECENT_TITLE_WINDOW_DAYS = 120;
const MAX_BACKOFF_MS = 24 * 60 * 60 * 1000;

const EXISTING_COLUMNS = "id,title,canonical_url,source_provider,external_id,content_hash,state,review_state";

function emptySummary(source: Pick<IntegrationSourceRow, "key" | "name">): RunSummary {
  return {
    sourceKey: source.key,
    sourceName: source.name,
    status: "running",
    found: 0,
    created: 0,
    updated: 0,
    published: 0,
    queued: 0,
    duplicates: 0,
    skipped: 0,
    errors: 0,
    requests: 0,
    message: null,
  };
}

async function readSettings(client: Client) {
  const { data } = await client.from("app_settings").select("key,value");
  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  return {
    automationEnabled: map.get("automation_enabled") !== false,
    categoryModes: (map.get("category_publish_modes") ?? {}) as Partial<Record<OpportunityCategory, "manual" | "auto">>,
  };
}

/** Cek link resmi masih dapat diakses (HEAD, fallback GET). Hanya untuk kandidat auto-publish. */
async function checkLink(url: string, deadline: number): Promise<boolean> {
  try {
    const res = await fetchWithRetry(url, { method: "HEAD", deadline, retries: 0, timeoutMs: 8000, acceptStatus: [405] });
    if (res.status !== 405) return true;
    await fetchWithRetry(url, { deadline, retries: 0, timeoutMs: 8000 });
    return true;
  } catch {
    return false;
  }
}

async function loadExisting(client: Client, source: SourceConfig, candidates: NormalizedCandidate[]): Promise<ExistingRef[]> {
  const byId = new Map<string, ExistingRef>();
  const ids = candidates.map((c) => c.externalId);
  const urls = [...new Set(candidates.map((c) => c.canonicalUrl))];

  for (let i = 0; i < ids.length; i += 100) {
    const { data } = await client
      .from("opportunities")
      .select(EXISTING_COLUMNS)
      .eq("source_provider", source.key)
      .in("external_id", ids.slice(i, i + 100));
    for (const row of (data ?? []) as ExistingRef[]) byId.set(row.id, row);
  }
  for (let i = 0; i < urls.length; i += 100) {
    const { data } = await client.from("opportunities").select(EXISTING_COLUMNS).in("canonical_url", urls.slice(i, i + 100));
    for (const row of (data ?? []) as ExistingRef[]) byId.set(row.id, row);
  }
  const since = new Date(Date.now() - RECENT_TITLE_WINDOW_DAYS * 86_400_000).toISOString();
  const { data: recent } = await client
    .from("opportunities")
    .select(EXISTING_COLUMNS)
    .gte("created_at", since)
    .neq("state", "archived")
    .limit(1000);
  for (const row of (recent ?? []) as ExistingRef[]) byId.set(row.id, row);
  return [...byId.values()];
}

function candidateColumns(c: NormalizedCandidate) {
  return {
    title: c.title,
    summary: c.summary,
    content: c.content,
    organizer: c.organizer,
    ecosystems: c.ecosystems,
    skills: c.skills,
    tags: c.tags,
    external_url: c.externalUrl,
    source_url: c.sourceUrl,
    canonical_url: c.canonicalUrl,
    source_excerpt: c.sourceExcerpt,
    reward_value: c.rewardValue,
    reward_currency: c.rewardCurrency,
    reward_description: c.rewardDescription,
    reward_type: c.rewardType,
    reward_certainty: c.rewardCertainty,
    deadline_at: c.deadlineAt,
    starts_at: c.startsAt,
    requirements: c.requirements,
    cost_info: c.costInfo,
    is_free: c.isFree,
    country: c.country,
    content_hash: c.contentHash,
    risk_level: c.riskLevel,
    risk_flags: c.riskFlags,
    details: c.details as Record<string, string>,
  } satisfies Partial<OpportunityRow>;
}

async function runSource(
  client: Client,
  source: IntegrationSourceRow,
  trigger: SyncTrigger,
  categoryModes: Partial<Record<OpportunityCategory, "manual" | "auto">>,
  globalDeadline: number,
): Promise<RunSummary> {
  const summary = emptySummary(source);
  const startedAt = Date.now();
  const deadline = Math.min(globalDeadline, startedAt + PER_SOURCE_MAX_MS);
  const details: Record<string, unknown> = {};

  const { data: run } = await client
    .from("import_runs")
    .insert({ source_id: source.id, trigger, status: "running" })
    .select("id")
    .single();

  let fetchMeta: { etag?: string | null; lastModified?: string | null; notModified?: boolean } = {};
  let fatal: Error | null = null;

  try {
    if (source.is_paid) throw new ConfigError("Sumber berbayar dikunci nonaktif (anggaran Rp0).");
    const adapter = getAdapter(source.adapter);
    if (!adapter) throw new ConfigError(`Adapter "${source.adapter}" belum tersedia untuk sumber ini.`);

    const gate = makeQuotaGate(source.key, async (amount) => {
      const { data, error } = await client.rpc("consume_api_quota", {
        p_source_key: source.key,
        p_daily: source.daily_quota,
        p_monthly: source.monthly_quota,
        p_amount: amount,
      });
      if (error) throw new Error(`Gagal memeriksa kuota: ${error.message}`);
      return data === true;
    });

    const result = await adapter.fetchItems(source, { beforeRequest: gate.beforeRequest, env: process.env, deadline });
    summary.requests = result.requests;
    fetchMeta = result;
    summary.found = result.items.length;

    // Normalisasi + saring
    const candidates: Array<{ raw: RawItem; c: NormalizedCandidate }> = [];
    const skipReasons: Record<string, number> = {};
    const skip = (reason: string) => {
      summary.skipped++;
      skipReasons[reason] = (skipReasons[reason] ?? 0) + 1;
    };
    for (const raw of result.items) {
      const out = normalizeItem(raw, source);
      if (!out.ok) {
        skip(out.reason);
        continue;
      }
      if (deadlineStatus(out.candidate.deadlineAt) === "expired") {
        skip("expired");
        continue;
      }
      if (!out.candidate.deadlineAt && isStale(raw.publishedAt, MAX_NEWS_AGE_DAYS)) {
        skip("stale");
        continue;
      }
      candidates.push({ raw, c: out.candidate });
    }

    if (trigger === "test") {
      details.sample = candidates.slice(0, 5).map(({ c }) => ({
        title: c.title,
        category: c.category,
        organizer: c.organizer,
        reward: c.rewardDescription,
        risk: c.riskLevel,
        missing: c.missing.map((r) => requirementLabel(c.category, r)),
        details: c.details,
      }));
      details.skipReasons = skipReasons;
      summary.status = "success";
      return summary;
    }

    const existing = await loadExisting(client, source, candidates.map((x) => x.c));
    const unchangedIds: string[] = [];
    const now = new Date().toISOString();

    for (const { c } of candidates) {
      if (Date.now() > deadline - 2000) {
        details.truncated = true;
        break;
      }
      try {
        const dup = findDuplicate({ sourceKey: source.key, externalId: c.externalId, canonicalUrl: c.canonicalUrl, title: c.title }, existing);

        const decide = async (possibleDuplicate: boolean) => {
          const categoryMode = categoryModes[c.category] ?? "manual";
          const wantsAuto =
            source.publish_mode === "auto" && categoryMode === "auto" && source.trusted && c.riskLevel === "low" && c.missing.length === 0;
          const linkOk = wantsAuto ? await checkLink(c.externalUrl, deadline) : null;
          const decision = decidePublish({
            sourceMode: source.publish_mode,
            categoryMode,
            trusted: source.trusted,
            riskLevel: c.riskLevel,
            missingRequired: c.missing.map((r) => requirementLabel(c.category, r)),
            deadline: deadlineStatus(c.deadlineAt),
            linkOk,
            possibleDuplicate,
          });
          return { decision, linkOk };
        };

        if (dup?.kind === "same_source") {
          if (dup.existing.content_hash === c.contentHash) {
            unchangedIds.push(dup.existing.id);
            skip("unchanged");
            continue;
          }
          const state = dup.existing.state;
          let update: Partial<OpportunityRow>;
          let publishedNow = false;
          if (state === "draft") {
            // Draft (belum direview): perbarui isi & nilai ulang kelayakan auto-publish.
            const { decision, linkOk } = await decide(false);
            publishedNow = decision.publish;
            update = {
              ...candidateColumns(c),
              last_checked_at: now,
              source_changed_at: now,
              review_note: decision.publish ? null : decision.reasons.join(" · "),
              ...(decision.publish
                ? { state: "published", review_state: "approved", published_at: now, verified_at: linkOk ? now : null }
                : {}),
            };
          } else if (state === "archived") {
            // Sudah ditolak/diarsipkan admin: jangan dimunculkan lagi di antrean.
            update = { content_hash: c.contentHash, last_checked_at: now };
          } else {
            // Sudah tayang/berakhir: tandai agar admin memeriksa perubahan sumber.
            update = { content_hash: c.contentHash, last_checked_at: now, source_changed_at: now, review_state: "changed" };
          }
          const { error } = await client.from("opportunities").update(update).eq("id", dup.existing.id);
          if (error) throw new Error(error.message);
          summary.updated++;
          if (publishedNow) summary.published++;
          continue;
        }

        if (dup?.kind === "same_url") {
          summary.duplicates++;
          continue;
        }

        const { decision, linkOk } = await decide(dup?.kind === "similar_title");

        const slug = `${slugify(c.title) || "peluang"}-${hashContent([source.key, c.externalId]).slice(0, 6)}`;
        const { data: inserted, error } = await client
          .from("opportunities")
          .upsert(
            {
              ...candidateColumns(c),
              slug,
              category: c.category,
              source_provider: source.key,
              source_name: source.name,
              source_id: source.id,
              external_id: c.externalId,
              import_method: source.kind === "rss" ? "rss" : "api",
              discovered_at: now,
              last_checked_at: now,
              state: decision.publish ? "published" : "draft",
              review_state: decision.publish ? "approved" : "pending",
              review_note: decision.publish ? null : decision.reasons.join(" · "),
              published_at: decision.publish ? now : null,
              verified_at: decision.publish && linkOk ? now : null,
              duplicate_of: dup?.kind === "similar_title" ? dup.existing.id : null,
            },
            { onConflict: "source_provider,external_id", ignoreDuplicates: true },
          )
          .select("id");
        if (error) throw new Error(error.message);
        if (!inserted || inserted.length === 0) {
          skip("already_imported");
          continue;
        }
        summary.created++;
        if (decision.publish) summary.published++;
        else summary.queued++;
        if (dup?.kind === "similar_title") summary.duplicates++;
        existing.push({
          id: inserted[0]!.id,
          title: c.title,
          canonical_url: c.canonicalUrl,
          source_provider: source.key,
          external_id: c.externalId,
          content_hash: c.contentHash,
          state: decision.publish ? "published" : "draft",
          review_state: decision.publish ? "approved" : "pending",
        });
      } catch (error) {
        summary.errors++;
        details.itemErrors = [...((details.itemErrors as string[]) ?? []), `${c.title}: ${(error as Error).message}`].slice(0, 5);
      }
    }

    if (unchangedIds.length) {
      await client.from("opportunities").update({ last_checked_at: now }).in("id", unchangedIds);
    }
    details.skipReasons = skipReasons;
    summary.status = summary.errors > 0 ? "partial" : "success";
  } catch (error) {
    fatal = error as Error;
    summary.status = error instanceof QuotaExceededError && summary.found > 0 ? "partial" : "failed";
    summary.message = fatal.message;
    summary.errors++;
  } finally {
    if (summary.status === "running") summary.status = "failed";
    const finishedAt = new Date().toISOString();
    if (run?.id) {
      await client
        .from("import_runs")
        .update({
          status: summary.status,
          finished_at: finishedAt,
          found: summary.found,
          created: summary.created,
          updated: summary.updated,
          published: summary.published,
          queued: summary.queued,
          duplicates: summary.duplicates,
          skipped: summary.skipped,
          errors: summary.errors,
          requests: summary.requests,
          error_message: summary.message,
          details,
        })
        .eq("id", run.id);
    }

    if (trigger !== "test") {
      const failed = summary.status === "failed";
      const failures = failed ? source.consecutive_failures + 1 : 0;
      const backoffMs = failed ? Math.min(15 * 60_000 * 2 ** (failures - 1), MAX_BACKOFF_MS) : 0;
      await client
        .from("integration_sources")
        .update({
          last_run_at: finishedAt,
          last_success_at: failed ? source.last_success_at : finishedAt,
          next_run_at: new Date(Date.now() + source.interval_minutes * 60_000).toISOString(),
          last_status: summary.status,
          last_error: summary.message,
          consecutive_failures: failures,
          backoff_until: failed ? new Date(Date.now() + backoffMs).toISOString() : null,
          http_etag: fetchMeta.etag ?? source.http_etag,
          http_last_modified: fetchMeta.lastModified ?? source.http_last_modified,
        })
        .eq("id", source.id);
    }
  }
  return summary;
}

/**
 * Titik masuk sinkronisasi. Aman dipanggil berulang: lock mencegah proses
 * bertumpuk, unique (source_provider, external_id) mencegah duplikasi.
 */
export async function runOpportunitySync(options: {
  trigger: SyncTrigger;
  sourceKeys?: string[];
  force?: boolean;
  budgetMs?: number;
}): Promise<SyncResult> {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return { status: "not_configured", expired: 0, runs: [], pendingSources: [] };
  }
  const client = await createSupabaseServiceRoleClient();
  const budgetMs = options.budgetMs ?? DEFAULT_BUDGET_MS;
  const globalDeadline = Date.now() + budgetMs;

  const settings = await readSettings(client);
  if (!settings.automationEnabled && options.trigger === "cron") {
    return { status: "disabled", expired: 0, runs: [], pendingSources: [] };
  }

  const holder = randomUUID();
  const { data: locked } = await client.rpc("acquire_job_lock", {
    p_name: LOCK_NAME,
    p_holder: holder,
    p_ttl_seconds: Math.ceil(budgetMs / 1000) + 60,
  });
  if (!locked) return { status: "locked", expired: 0, runs: [], pendingSources: [] };

  try {
    const { data: expired } = await client.rpc("expire_opportunities");

    let query = client.from("integration_sources").select("*").eq("enabled", true).eq("is_paid", false);
    if (options.sourceKeys?.length) query = query.in("key", options.sourceKeys);
    const { data: sources } = await query.order("next_run_at", { ascending: true, nullsFirst: true });

    const nowIso = new Date().toISOString();
    const due = (sources ?? []).filter(
      (s) =>
        options.force ||
        ((!s.next_run_at || s.next_run_at <= nowIso) && (!s.backoff_until || s.backoff_until <= nowIso)),
    );

    const runs: RunSummary[] = [];
    const pendingSources: string[] = [];
    for (const source of due) {
      if (globalDeadline - Date.now() < 8000) {
        pendingSources.push(source.key);
        continue;
      }
      runs.push(await runSource(client, source, options.trigger, settings.categoryModes, globalDeadline));
    }
    return { status: "ok", expired: expired ?? 0, runs, pendingSources };
  } finally {
    await client.rpc("release_job_lock", { p_name: LOCK_NAME, p_holder: holder });
  }
}

/** Tes koneksi satu sumber: fetch + normalisasi tanpa menulis peluang. */
export async function testSourceConnection(sourceKey: string): Promise<RunSummary & { sample: unknown }> {
  const client = await createSupabaseServiceRoleClient();
  const { data: source } = await client.from("integration_sources").select("*").eq("key", sourceKey).single();
  if (!source) throw new Error("Sumber tidak ditemukan.");
  if (source.is_paid) throw new Error("Sumber berbayar dikunci nonaktif.");
  const summary = await runSource(client, source, "test", {}, Date.now() + PER_SOURCE_MAX_MS);
  const { data: lastRun } = await client
    .from("import_runs")
    .select("details")
    .eq("source_id", source.id)
    .eq("trigger", "test")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return { ...summary, sample: (lastRun?.details as { sample?: unknown } | undefined)?.sample ?? [] };
}
