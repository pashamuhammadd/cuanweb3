import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapOpportunityRow } from "@/types/opportunity";
import type { OpportunityRow } from "@/lib/supabase/database.types";

export async function listBookmarkedOpportunities(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("bookmarks")
    .select("opportunity_id, opportunities(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data
    .map((row) => (row as unknown as { opportunities: OpportunityRow | null }).opportunities)
    .filter((row): row is OpportunityRow => Boolean(row))
    .map(mapOpportunityRow);
}
