"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OPPORTUNITY_CATEGORIES } from "@/lib/supabase/database.types";
import { CATEGORY_HREFS } from "@/lib/categories";
import { canonicalUrl } from "@/lib/engine/url";

const optionalHttpUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\//i.test(v), "URL harus diawali http:// atau https://")
  .refine((v) => {
    if (!v) return true;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }, "URL tidak valid");

const OpportunitySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan tanda hubung"),
  category: z.enum(OPPORTUNITY_CATEGORIES),
  title: z.string().trim().min(5).max(200),
  summary: z.string().trim().min(10).max(400),
  content: z.string().trim().min(10).max(20000),
  organizer: z.string().trim().max(120).optional(),
  ecosystems: z.string().max(300).optional(),
  skills: z.string().max(300).optional(),
  rewardDescription: z.string().max(200).optional(),
  rewardCertainty: z.enum(["guaranteed", "competition", "raffle", "unconfirmed", "unknown"]),
  costInfo: z.string().trim().max(200).optional(),
  requirements: z.string().max(2000).optional(),
  tags: z.string().max(300).optional(),
  country: z.string().max(120).optional(),
  startsAt: z.string().optional(),
  deadlineAt: z.string().optional(),
  externalUrl: optionalHttpUrl,
  sourceUrl: optionalHttpUrl,
  state: z.enum(["draft", "published", "expired", "archived"]),
  isFree: z.boolean(),
  adExcluded: z.boolean(),
  markVerified: z.boolean(),
  previousPublishedAt: z.string().optional(),
});

export type SaveOpportunityState = {
  status: "idle" | "error";
  message?: string;
};

function toArray(value?: string, lower = false): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => (lower ? v.trim().toLowerCase() : v.trim()))
    .filter(Boolean)
    .slice(0, 20);
}

function toIsoOrNull(value?: string): string | null {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? new Date(t).toISOString() : null;
}

export async function saveOpportunity(
  _prev: SaveOpportunityState,
  formData: FormData,
): Promise<SaveOpportunityState> {
  const admin = await requireAdmin();
  const str = (key: string) => formData.get(key)?.toString();

  const parsed = OpportunitySchema.safeParse({
    id: str("id") || undefined,
    slug: formData.get("slug"),
    category: formData.get("category"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    organizer: str("organizer"),
    ecosystems: str("ecosystems"),
    skills: str("skills"),
    rewardDescription: str("rewardDescription"),
    rewardCertainty: str("rewardCertainty") || "unknown",
    costInfo: str("costInfo"),
    requirements: str("requirements"),
    tags: str("tags"),
    country: str("country"),
    startsAt: str("startsAt"),
    deadlineAt: str("deadlineAt"),
    externalUrl: str("externalUrl"),
    sourceUrl: str("sourceUrl"),
    state: formData.get("state"),
    isFree: formData.get("isFree") === "on",
    adExcluded: formData.get("adExcluded") === "on",
    markVerified: formData.get("markVerified") === "on",
    previousPublishedAt: str("previousPublishedAt") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const d = parsed.data;
  const now = new Date().toISOString();
  const sourceUrl = d.sourceUrl || null;

  const supabase = await createSupabaseServerClient();
  const payload = {
    slug: d.slug,
    category: d.category,
    title: d.title,
    summary: d.summary,
    content: d.content,
    organizer: d.organizer || null,
    ecosystems: toArray(d.ecosystems, true),
    skills: toArray(d.skills, true),
    reward_description: d.rewardDescription || null,
    reward_certainty: d.rewardCertainty,
    cost_info: d.costInfo || null,
    requirements: toArray(d.requirements),
    tags: toArray(d.tags),
    country: d.country || null,
    starts_at: toIsoOrNull(d.startsAt),
    deadline_at: toIsoOrNull(d.deadlineAt),
    external_url: d.externalUrl || null,
    source_url: sourceUrl,
    canonical_url: sourceUrl ? canonicalUrl(sourceUrl) : d.externalUrl ? canonicalUrl(d.externalUrl) : null,
    state: d.state,
    is_free: d.isFree,
    ad_excluded: d.adExcluded,
    // Pertahankan tanggal publish pertama agar urutan "terbaru" tidak berubah saat edit.
    published_at: d.state === "published" ? (d.previousPublishedAt ?? now) : d.previousPublishedAt ?? null,
    // Simpan oleh admin = keputusan review final.
    review_state: d.state === "published" ? ("approved" as const) : undefined,
    ...(d.markVerified ? { verified_at: now, last_checked_at: now } : {}),
  };

  if (d.id) {
    const { error } = await supabase.from("opportunities").update(payload).eq("id", d.id);
    if (error) return { status: "error", message: error.code === "23505" ? "Slug sudah dipakai." : error.message };
  } else {
    const { error } = await supabase
      .from("opportunities")
      .insert({ ...payload, created_by: admin.id, import_method: "manual" });
    if (error) return { status: "error", message: error.code === "23505" ? "Slug sudah dipakai." : error.message };
  }

  revalidatePath("/admin/opportunities");
  revalidatePath("/admin/automation/review");
  revalidatePath("/");
  revalidatePath("/peluang");
  revalidatePath(CATEGORY_HREFS[d.category]);
  revalidatePath(`/peluang/${d.slug}`);
  redirect("/admin/opportunities");
}

export async function deleteOpportunity(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase.from("opportunities").update({ state: "archived" }).eq("id", z.string().uuid().parse(id));
  revalidatePath("/admin/opportunities");
}
