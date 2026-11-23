import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapOpportunityRow, type Opportunity, type OpportunityCategory, type OpportunityFilters } from "@/types/opportunity";
import { SEED_OPPORTUNITIES } from "./seed/opportunities";

function applyFilters(items: Opportunity[], filters: OpportunityFilters): Opportunity[] {
  let result = items;
  if (filters.category) {
    result = result.filter((o) => o.category === filters.category);
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
}> {
  if (!isSupabaseConfigured()) {
    return { items: applyFilters(SEED_OPPORTUNITIES, filters), isDemoData: true };
  }

  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("opportunities")
    .select("*")
    .eq("state", "published")
    .order("published_at", { ascending: false });

  if (filters.category) query = query.eq("category", filters.category);
  if (filters.freeOnly) query = query.eq("is_free", true);
  if (filters.search) query = query.ilike("title", `%${filters.search}%`);

  const { data, error } = await query;

  if (error || !data) {
    return { items: applyFilters(SEED_OPPORTUNITIES, filters), isDemoData: true };
  }

  return { items: data.map(mapOpportunityRow), isDemoData: false };
}

export async function listOpportunitiesByCategory(
  category: OpportunityCategory,
  filters: Omit<OpportunityFilters, "category"> = {},
) {
  return listOpportunities({ ...filters, category });
}

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
    .eq("state", "published")
    .maybeSingle();

  if (error || !data) {
    return { item: null, isDemoData: false };
  }

  return { item: mapOpportunityRow(data), isDemoData: false };
}

export async function listFeaturedOpportunities(limit = 3) {
  const { items, isDemoData } = await listOpportunities();
  return { items: items.slice(0, limit), isDemoData };
}
