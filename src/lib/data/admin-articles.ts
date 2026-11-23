import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ArticleRow } from "@/lib/supabase/database.types";

export async function listAllArticlesForAdmin(): Promise<ArticleRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getArticleForAdmin(id: string): Promise<ArticleRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
