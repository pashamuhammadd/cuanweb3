import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OpportunityRow } from "@/lib/supabase/database.types";

export async function listAllOpportunitiesForAdmin(): Promise<OpportunityRow[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data;
}

export async function getOpportunityForAdmin(id: string): Promise<OpportunityRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}
