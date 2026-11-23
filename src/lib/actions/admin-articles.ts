"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ArticleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug hanya huruf kecil, angka, dan tanda hubung"),
  title: z.string().trim().min(5),
  summary: z.string().trim().min(10),
  content: z.string().trim().min(10),
  state: z.enum(["draft", "published", "expired", "archived"]),
});

export type SaveArticleState = { status: "idle" | "error"; message?: string };

export async function saveArticle(
  _prev: SaveArticleState,
  formData: FormData,
): Promise<SaveArticleState> {
  const admin = await requireAdmin();

  const parsed = ArticleSchema.safeParse({
    id: formData.get("id")?.toString() || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    state: formData.get("state"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    slug: parsed.data.slug,
    title: parsed.data.title,
    summary: parsed.data.summary,
    content: parsed.data.content,
    state: parsed.data.state,
    published_at: parsed.data.state === "published" ? new Date().toISOString() : null,
  };

  if (parsed.data.id) {
    const { error } = await supabase.from("articles").update(payload).eq("id", parsed.data.id);
    if (error) return { status: "error", message: error.message };
  } else {
    const { error } = await supabase
      .from("articles")
      .insert({ ...payload, created_by: admin.id });
    if (error) return { status: "error", message: error.message };
  }

  revalidatePath("/admin/articles");
  revalidatePath("/belajar");
  redirect("/admin/articles");
}
