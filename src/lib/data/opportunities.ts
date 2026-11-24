import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapOpportunityRow, type Opportunity, type OpportunityCategory, type OpportunityFilters } from "@/types/opportunity";
import { SEED_OPPORTUNITIES } from "./seed/opportunities";

/** Halaman peluang berakhir tetap terindeks N hari, lalu noindex (lihat detail page). */
export const EXPIRED_INDEX_DAYS = 30;

function applyFilters(items: Opportunity[], filters: OpportunityFilters): Opportunity[] {
  let result = items;
  if (filters.category) {
    result = result.filter((o) => o.category === filters.category);
  }
  if (filters.categories?.length) {
    result = result.filter((o) => filters.categories!.includes(o.category));
  }
  if (filters.freeOnly) {
    result = result.filter((o) => o.isFree);
  }
  if (filters.deadlineSoon) {
    const soon = Date.now() + 14 * 24 * 60 * 60 * 1000;
    result = result.filter((o) => o.deadlineAt && new Date(o.deadlineAt).getTime() <= soon);
  }
  if (filters.skill) {
    const skill = filters.skill.toLowerCase();
    result = result.filter((o) => o.tags.some((t) => t.toLowerCase().includes(skill)));
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.summary.toLowerCase().includes(q) ||
        o.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return result;
}

export async function listOpportunities(filters: OpportunityFilters = {}): Promise<{
  items: Opportunity[];
  isDemoData: boolean;
  hasError?: boolean;
}> {
  // Data contoh HANYA saat Supabase belum dikonfigurasi (pengembangan lokal).
  if (!isSupabaseConfigured()) {
    return { items: applyFilters(SEED_OPPORTUNITIES, filters), isDemoData: true };
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("state", "published")
    .order("published_at", { ascending: false })
    .limit(300);

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.categories?.length) query = query.in("category", filters.categories);
  if (filters.freeOnly) query = query.eq("is_free", true);
  if (filters.search) query = query.ilike("title", `%${filters.search.replace(/[%_]/g, "")}%`);

  const { data, error } = await query;

  if (error || !data) {
    // Jangan pernah mengganti kegagalan produksi dengan data demo.
    console.error("[listOpportunities]", error?.message);
    return { items: [], isDemoData: false, hasError: true };
  }

  return { items: data.map(mapOpportunityRow), isDemoData: false };
}

export async function listOpportunitiesByCategory(
  category: OpportunityCategory | OpportunityCategory[],
  filters: Omit<OpportunityFilters, "category" | "categories"> = {},
) {
  return Array.isArray(category)
    ? listOpportunities({ ...filters, categories: category })
    : listOpportunities({ ...filters, category });
}

/** Detail: published, atau expired (tetap tampil dengan label "Berakhir"). */
export async function getOpportunityBySlug(slug: string): Promise<{
  item: Opportunity | null;
  isDemoData: boolean;
}> {
  if (!isSupabaseConfigured()) {
    const item = SEED_OPPORTUNITIES.find((o) => o.slug === slug) ?? null;
    return { item, isDemoData: true };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", slug)
    .in("state", ["published", "expired"])
    .maybeSingle();

  if (error || !data) {
    return { item: null, isDemoData: false };
  }

  return { item: mapOpportunityRow(data), isDemoData: false };
}

/** Untuk sitemap: published + expired yang masih dalam masa indeks. */
export async function listIndexableOpportunities(expiredIndexDays = EXPIRED_INDEX_DAYS): Promise<
  Array<{ slug: string; updatedAt: string | null }>
> {
  if (!isSupabaseConfigured()) {
    return SEED_OPPORTUNITIES.map((o) => ({ slug: o.slug, updatedAt: null }));
  }
  const supabase = await createSupabaseServerClient();
  const cutoff = new Date(Date.now() - expiredIndexDays * 86_400_000).toISOString();
  const { data } = await supabase
    .from("opportunities")
    .select("slug,updated_at,state,expired_at")
    .in("state", ["published", "expired"])
    .order("updated_at", { ascending: false })
    .limit(5000);
  return (data ?? [])
    .filter((r) => r.state === "published" || (r.expired_at ?? "") >= cutoff)
    .map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
}

export async function listFeaturedOpportunities(limit = 3) {
  const { items, isDemoData } = await listOpportunities();
  return { items: items.slice(0, limit), isDemoData };
}
