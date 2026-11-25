import type { Opportunity } from "@/types/opportunity";
import type { OpportunityCategory } from "@/lib/supabase/database.types";

export function countByCategory(items: Pick<Opportunity, "category">[]): Partial<Record<OpportunityCategory, number>> {
  const counts: Partial<Record<OpportunityCategory, number>> = {};
  for (const item of items) counts[item.category] = (counts[item.category] ?? 0) + 1;
  return counts;
}
