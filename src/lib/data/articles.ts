import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SEED_ARTICLES } from "./seed/articles";

export type Article = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  publishedAt: string | null;
  isDemo: boolean;
};

export async function listPublishedArticles(): Promise<{
  items: Article[];
  isDemoData: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      items: SEED_ARTICLES.map((a) => ({ ...a, isDemo: true })),
      isDemoData: true,
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("state", "published")
    .order("published_at", { ascending: false });

  if (error || !data) {
    return {
      items: SEED_ARTICLES.map((a) => ({ ...a, isDemo: true })),
      isDemoData: true,
    };
  }

  return {
    items: data.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      content: row.content,
      publishedAt: row.published_at,
      isDemo: false,
    })),
    isDemoData: false,
  };
}

export async function getArticleBySlug(slug: string): Promise<{
  item: Article | null;
  isDemoData: boolean;
}> {
  if (!isSupabaseConfigured()) {
    const seed = SEED_ARTICLES.find((a) => a.slug === slug);
    return { item: seed ? { ...seed, isDemo: true } : null, isDemoData: true };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("state", "published")
    .maybeSingle();

  if (error || !data) return { item: null, isDemoData: false };

  return {
    item: {
      id: data.id,
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      content: data.content,
      publishedAt: data.published_at,
      isDemo: false,
    },
    isDemoData: false,
  };
}
