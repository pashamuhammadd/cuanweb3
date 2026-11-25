"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OPPORTUNITY_CATEGORIES } from "@/lib/supabase/database.types";
import { CATEGORY_HREFS } from "@/lib/categories";
import { runOpportunitySync, testSourceConnection } from "@/lib/engine/runner";

export type ActionResult = { status: "idle" | "ok" | "error"; message?: string; detail?: string };

const SourceKey = z.string().regex(/^[a-z0-9_]{2,40}$/);
const Uuid = z.string().uuid();

function revalidateAutomation() {
  revalidatePath("/admin/automation", "layout");
}

function serviceRoleMissing(): ActionResult | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY
    ? null
    : { status: "error", message: "SUPABASE_SERVICE_ROLE_KEY belum diisi di environment server (Vercel)." };
}

// ---------------------------------------------------------------- Sources

const SourceUpdate = z.object({
  id: Uuid,
  enabled: z.boolean(),
  trusted: z.boolean(),
  publishMode: z.enum(["manual", "auto"]),
  intervalMinutes: z.coerce.number().int().min(60).max(10080),
  dailyQuota: z.coerce.number().int().min(0).max(100000).nullable(),
  monthlyQuota: z.coerce.number().int().min(0).max(3000000).nullable(),
  categories: z.array(z.enum(OPPORTUNITY_CATEGORIES)).max(10),
});

export async function updateSource(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const num = (k: string) => {
    const v = formData.get(k)?.toString().trim();
    return v ? v : null;
  };
  const parsed = SourceUpdate.safeParse({
    id: formData.get("id"),
    enabled: formData.get("enabled") === "on",
    trusted: formData.get("trusted") === "on",
    publishMode: formData.get("publishMode"),
    intervalMinutes: formData.get("intervalMinutes"),
    dailyQuota: num("dailyQuota"),
    monthlyQuota: num("monthlyQuota"),
    categories: formData.getAll("categories").map(String),
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  const d = parsed.data;

  const supabase = await createSupabaseServerClient();
  const { data: current } = await supabase
    .from("integration_sources")
    .select("is_paid,adapter,requires_api_key,api_key_env")
    .eq("id", d.id)
    .single();
  if (!current) return { status: "error", message: "Sumber tidak ditemukan." };
  if (d.enabled && current.is_paid) {
    return { status: "error", message: "Sumber berbayar tidak dapat diaktifkan (anggaran Rp0)." };
  }
  if (d.enabled && current.adapter === "none") {
    return { status: "error", message: "Sumber ini belum memiliki adapter yang diizinkan." };
  }
  if (d.enabled && current.requires_api_key && current.api_key_env && !process.env[current.api_key_env]) {
    return { status: "error", message: `Isi env server ${current.api_key_env} terlebih dahulu.` };
  }

  const { error } = await supabase
    .from("integration_sources")
    .update({
      enabled: d.enabled,
      trusted: d.trusted,
      publish_mode: d.publishMode,
      interval_minutes: d.intervalMinutes,
      daily_quota: d.dailyQuota,
      monthly_quota: d.monthlyQuota,
      categories: d.categories,
    })
    .eq("id", d.id);
  if (error) return { status: "error", message: error.message };
  revalidateAutomation();
  return { status: "ok", message: "Pengaturan sumber tersimpan." };
}

const NewRssSource = z.object({
  name: z.string().trim().min(3).max(80),
  url: z
    .string()
    .trim()
    .url()
    .refine((u) => u.startsWith("https://"), "Feed harus memakai HTTPS."),
  homepageUrl: z.string().trim().url().optional().or(z.literal("")),
  defaultCategory: z.enum(OPPORTUNITY_CATEGORIES),
  ecosystems: z.string().max(200).optional(),
  keywordFilter: z.boolean(),
});

export async function addRssSource(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = NewRssSource.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    homepageUrl: formData.get("homepageUrl")?.toString() ?? "",
    defaultCategory: formData.get("defaultCategory"),
    ecosystems: formData.get("ecosystems")?.toString(),
    keywordFilter: formData.get("keywordFilter") === "on",
  });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  const d = parsed.data;
  const key = d.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  if (key.length < 2) return { status: "error", message: "Nama sumber tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("integration_sources").insert({
    key,
    name: d.name,
    adapter: "rss",
    kind: "rss",
    url: d.url,
    homepage_url: d.homepageUrl || null,
    default_category: d.defaultCategory,
    categories: [],
    ecosystems: (d.ecosystems ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10),
    keyword_filter: d.keywordFilter,
    interval_minutes: 360,
    daily_quota: 8,
    monthly_quota: 250,
  });
  if (error) return { status: "error", message: error.code === "23505" ? "Sumber dengan nama ini sudah ada." : error.message };
  revalidateAutomation();
  return {
    status: "ok",
    message: "Sumber ditambahkan dalam keadaan NONAKTIF dan mode manual. Tes koneksi lalu aktifkan.",
  };
}

export async function testSource(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const missing = serviceRoleMissing();
  if (missing) return missing;
  const key = SourceKey.safeParse(formData.get("key"));
  if (!key.success) return { status: "error", message: "Sumber tidak valid." };
  try {
    const result = await testSourceConnection(key.data);
    revalidateAutomation();
    if (result.status === "failed") return { status: "error", message: result.message ?? "Tes koneksi gagal." };
    const sample = (result.sample as Array<{ title: string; category: string }>) ?? [];
    return {
      status: "ok",
      message: `Terhubung: ${result.found} item diambil, ${sample.length ? `${result.found - result.skipped} relevan` : "0 relevan saat ini"} (${result.requests} request).`,
      detail: sample.map((s) => `[${s.category}] ${s.title}`).join("\n"),
    };
  } catch (error) {
    return { status: "error", message: (error as Error).message };
  }
}

export async function runSyncNow(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const missing = serviceRoleMissing();
  if (missing) return missing;
  const rawKey = formData.get("key")?.toString();
  const key = rawKey ? SourceKey.safeParse(rawKey) : null;
  if (key && !key.success) return { status: "error", message: "Sumber tidak valid." };

  const result = await runOpportunitySync({
    trigger: "manual",
    sourceKeys: key?.success ? [key.data] : undefined,
    // Dijalankan admin secara manual: abaikan jadwal & cache agar draft dinilai ulang.
    force: true,
    budgetMs: 45_000,
  });
  revalidateAutomation();
  revalidatePath("/");
  revalidatePath("/peluang");
  if (result.status === "locked") return { status: "error", message: "Sinkronisasi lain sedang berjalan. Coba lagi beberapa menit." };
  if (result.status === "not_configured") return { status: "error", message: "Service role key belum dikonfigurasi." };
  if (result.runs.length === 0) {
    return { status: "ok", message: key ? "Sumber nonaktif atau tidak ditemukan." : "Tidak ada sumber aktif." };
  }
  const t = result.runs.reduce(
    (a, r) => ({ c: a.c + r.created, p: a.p + r.published, q: a.q + r.queued, d: a.d + r.duplicates, e: a.e + r.errors }),
    { c: 0, p: 0, q: 0, d: 0, e: 0 },
  );
  return {
    status: t.e > 0 ? "error" : "ok",
    message: `${result.runs.length} sumber diproses: ${t.c} baru, ${t.p} dipublikasikan, ${t.q} ke antrean review, ${t.d} duplikat, ${t.e} error.${result.pendingSources.length ? ` Sisa ${result.pendingSources.length} sumber diproses pada jadwal berikutnya.` : ""}`,
    detail: result.runs.map((r) => `${r.sourceName}: ${r.status}${r.message ? `: ${r.message}` : ""}`).join("\n"),
  };
}

// ---------------------------------------------------------------- Review

export async function reviewOpportunity(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = Uuid.safeParse(formData.get("id"));
  const decision = z.enum(["approve", "reject", "keep_published"]).safeParse(formData.get("decision"));
  if (!id.success || !decision.success) return { status: "error", message: "Permintaan tidak valid." };

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("opportunities")
    .select("id,slug,category,state,deadline_at,published_at,risk_level")
    .eq("id", id.data)
    .single();
  if (!row) return { status: "error", message: "Peluang tidak ditemukan." };

  const now = new Date().toISOString();
  let update;
  if (decision.data === "reject") {
    update = { review_state: "rejected" as const, state: "archived" as const };
  } else {
    if (row.deadline_at && Date.parse(row.deadline_at) < Date.now()) {
      return { status: "error", message: "Deadline sudah lewat, tidak dapat dipublikasikan." };
    }
    update = {
      review_state: "approved" as const,
      state: "published" as const,
      published_at: row.published_at ?? now,
      verified_at: now,
      last_checked_at: now,
      review_note: null,
    };
  }
  const { error } = await supabase.from("opportunities").update(update).eq("id", row.id);
  if (error) return { status: "error", message: error.message };

  revalidateAutomation();
  revalidatePath("/");
  revalidatePath("/peluang");
  revalidatePath(CATEGORY_HREFS[row.category]);
  revalidatePath(`/peluang/${row.slug}`);
  return { status: "ok", message: decision.data === "reject" ? "Ditolak dan diarsipkan." : "Dipublikasikan." };
}

// ---------------------------------------------------------------- Settings

const ModeSchema = z.enum(["manual", "auto"]);

export async function updateAutomationSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const modes: Record<string, "manual" | "auto"> = {};
  for (const c of OPPORTUNITY_CATEGORIES) {
    const parsed = ModeSchema.safeParse(formData.get(`mode_${c}`) ?? "manual");
    modes[c] = parsed.success ? parsed.data : "manual";
  }
  const supabase = await createSupabaseServerClient();
  const results = await Promise.all([
    supabase.from("app_settings").update({ value: formData.get("automationEnabled") === "on" }).eq("key", "automation_enabled"),
    supabase.from("app_settings").update({ value: modes }).eq("key", "category_publish_modes"),
  ]);
  const error = results.find((r) => r.error)?.error;
  if (error) return { status: "error", message: error.message };
  revalidateAutomation();
  return { status: "ok", message: "Pengaturan otomatisasi tersimpan." };
}
