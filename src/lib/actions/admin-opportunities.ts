"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OpportunitySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan tanda hubung"),
  category: z.enum(["airdrop", "giveaway", "bounty", "jobs", "hackathon", "grants"]),
  title: z.string().trim().min(5),
  summary: z.string().trim().min(10),
  content: z.string().trim().min(10),
  rewardDescription: z.string().optional(),
  requirements: z.string().optional(),
  tags: z.string().optional(),
  country: z.string().optional(),
  deadlineAt: z.string().optional(),
  externalUrl: z.string().optional(),
  sourceUrl: z.string().optional(),
  state: z.enum(["draft", "published", "expired", "archived"]),
  isFree: z.boolean(),
});

export type SaveOpportunityState = {
  status: "idle" | "error";
  message?: string;
};

function toArray(value?: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function toUrlOrNull(value?: string): string | null {
  if (!value || !value.trim()) return null;
  return value.trim();
}

export async function saveOpportunity(
  _prev: SaveOpportunityState,
  formData: FormData,
): Promise<SaveOpportunityState> {
  const admin = await requireAdmin();

  const parsed = OpportunitySchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    slug: formData.get("slug"),
    category: formData.get("category"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    rewardDescription: formData.get("rewardDescription")?.toString(),
    requirements: formData.get("requirements")?.toString(),
    tags: formData.get("tags")?.toString(),
    country: formData.get("country")?.toString(),
    deadlineAt: formData.get("deadlineAt")?.toString(),
    externalUrl: formData.get("externalUrl")?.toString(),
    sourceUrl: formData.get("sourceUrl")?.toString(),
    state: formData.get("state"),
    isFree: formData.get("isFree") === "on",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    slug: parsed.data.slug,
    category: parsed.data.category,
    title: parsed.data.title,
    summary: parsed.data.summary,
    content: parsed.data.content,
    reward_description: parsed.data.rewardDescription || null,
    requirements: toArray(parsed.data.requirements),
    tags: toArray(parsed.data.tags),
    country: parsed.data.country || null,
    deadline_at: parsed.data.deadlineAt
      ? new Date(parsed.data.deadlineAt).toISOString()
      : null,
    external_url: toUrlOrNull(parsed.data.externalUrl),
    source_url: toUrlOrNull(parsed.data.sourceUrl),
    state: parsed.data.state,
    is_free: parsed.data.isFree,
    published_at:
      parsed.data.state === "published" ? new Date().toISOString() : null,
  };

  if (parsed.data.id) {
    const { error } = await supabase
      .from("opportunities")
      .update(payload)
      .eq("id", parsed.data.id);
    if (error) return { status: "error", message: error.message };
  } else {
    const { error } = await supabase
      .from("opportunities")
      .insert({ ...payload, created_by: admin.id });
    if (error) return { status: "error", message: error.message };
  }

  revalidatePath("/admin/opportunities");
  revalidatePath("/peluang");
  revalidatePath(`/${parsed.data.category}`);
  redirect("/admin/opportunities");
}

export async function deleteOpportunity(id: string) {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase.from("opportunities").update({ state: "archived" }).eq("id", id);
  revalidatePath("/admin/opportunities");
}
