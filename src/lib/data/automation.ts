import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ApiUsageRow,
  ImportRunRow,
  IntegrationSourceRow,
  OpportunityCategory,
  OpportunityRow,
} from "@/lib/supabase/database.types";

/** Jadwal cron Supabase yang didokumentasikan di supabase/cron.sql. */
export const CRON_SCHEDULE_LABEL = "Setiap 3 jam (menit ke-7, UTC)";

export async function listSources(): Promise<IntegrationSourceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("integration_sources")
    .select("*")
    .order("is_paid", { ascending: true })
    .order("enabled", { ascending: false })
    .order("name");
  return data ?? [];
}

export async function getAutomationSettings() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("app_settings").select("key,value");
  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  return {
    automationEnabled: map.get("automation_enabled") !== false,
    aiEnrichmentEnabled: map.get("ai_enrichment_enabled") === true,
    categoryModes: (map.get("category_publish_modes") ?? {}) as Partial<Record<OpportunityCategory, "manual" | "auto">>,
  };
}

export async function listImportRuns(limit = 100): Promise<Array<ImportRunRow & { source_name: string | null }>> {
  const supabase = await createSupabaseServerClient();
  const [{ data: runs }, { data: sources }] = await Promise.all([
    supabase.from("import_runs").select("*").order("started_at", { ascending: false }).limit(limit),
    supabase.from("integration_sources").select("id,name"),
  ]);
  const names = new Map((sources ?? []).map((s) => [s.id, s.name]));
  return (runs ?? []).map((r) => ({ ...r, source_name: r.source_id ? (names.get(r.source_id) ?? null) : null }));
}

export type ReviewFilters = { source?: string; category?: string; view?: "queue" | "rejected" };

export async function listReviewQueue(filters: ReviewFilters): Promise<OpportunityRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("opportunities").select("*");
  query =
    filters.view === "rejected"
      ? query.eq("review_state", "rejected")
      : query.in("review_state", ["pending", "changed"]);
  if (filters.source) query = query.eq("source_provider", filters.source);
  if (filters.category) query = query.eq("category", filters.category as OpportunityCategory);
  const { data } = await query.order("discovered_at", { ascending: false, nullsFirst: false }).limit(200);
  return data ?? [];
}

export async function getOpportunityTitles(ids: string[]): Promise<Map<string, { title: string; slug: string; state: string }>> {
  if (ids.length === 0) return new Map();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("opportunities").select("id,title,slug,state").in("id", ids);
  return new Map((data ?? []).map((r) => [r.id, { title: r.title, slug: r.slug, state: r.state }]));
}

export async function getOverviewStats() {
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const count = async (build: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
    const { count: c } = await build(base());
    return c ?? 0;
  };
  function base() {
    return supabase.from("opportunities").select("id", { count: "exact", head: true });
  }

  const [pending, importedTotal, publishedImported, runs7d, sources] = await Promise.all([
    count((q) => q.in("review_state", ["pending", "changed"])),
    count((q) => q.neq("import_method", "manual")),
    count((q) => q.neq("import_method", "manual").eq("state", "published")),
    supabase
      .from("import_runs")
      .select("found,created,published,duplicates,errors,status,started_at,finished_at,trigger")
      .gte("started_at", since)
      .neq("trigger", "test")
      .order("started_at", { ascending: false }),
    supabase.from("integration_sources").select("enabled,next_run_at,last_run_at,is_paid"),
  ]);

  const r = runs7d.data ?? [];
  const sum = (k: "found" | "created" | "published" | "duplicates" | "errors") => r.reduce((n, x) => n + (x[k] ?? 0), 0);
  const enabled = (sources.data ?? []).filter((s) => s.enabled && !s.is_paid);
  const lastSync = r.find((x) => x.finished_at)?.finished_at ?? null;
  const nextRun = enabled
    .map((s) => s.next_run_at)
    .filter((v): v is string => Boolean(v))
    .sort()[0] ?? null;

  return {
    window: "7 hari terakhir",
    found: sum("found"),
    created: sum("created"),
    published: sum("published"),
    duplicates: sum("duplicates"),
    errors: sum("errors"),
    failedRuns: r.filter((x) => x.status === "failed").length,
    pending,
    importedTotal,
    publishedImported,
    lastSync,
    nextRun,
    enabledSources: enabled.length,
  };
}

export type UsageRow = {
  source: IntegrationSourceRow;
  today: number;
  month: number;
  blockedToday: number;
  remainingToday: number | null;
  remainingMonth: number | null;
  estimatedCostUsd: number;
};

export async function getApiUsage(): Promise<UsageRow[]> {
  const supabase = await createSupabaseServerClient();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthStart = `${today.slice(0, 7)}-01`;
  const [{ data: usage }, sources] = await Promise.all([
    supabase.from("api_usage").select("*").gte("day", monthStart),
    listSources(),
  ]);
  const rows = (usage ?? []) as ApiUsageRow[];
  return sources.map((source) => {
    const mine = rows.filter((u) => u.source_key === source.key);
    const t = mine.find((u) => u.day === today);
    const month = mine.reduce((n, u) => n + u.requests, 0);
    const todayCount = t?.requests ?? 0;
    return {
      source,
      today: todayCount,
      month,
      blockedToday: t?.blocked ?? 0,
      remainingToday: source.daily_quota == null ? null : Math.max(0, source.daily_quota - todayCount),
      remainingMonth: source.monthly_quota == null ? null : Math.max(0, source.monthly_quota - month),
      estimatedCostUsd: Math.round((month / 1000) * Number(source.cost_per_1k_requests_usd) * 100) / 100,
    };
  });
}
