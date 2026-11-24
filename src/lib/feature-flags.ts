import "server-only";
import { cache } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OpportunityCategory } from "@/lib/supabase/database.types";

export type FeatureFlagKey =
  | "ads_enabled"
  | "plus_enabled"
  | "plus_radar"
  | "plus_notifications"
  | "plus_deadline_reminders"
  | "plus_saved_filters"
  | "plus_recommendations"
  | "plus_agenda";

/** Semua flag default MATI; dibaca sekali per request. */
export const getFeatureFlags = cache(async (): Promise<Record<FeatureFlagKey, boolean>> => {
  const flags: Record<FeatureFlagKey, boolean> = {
    ads_enabled: false,
    plus_enabled: false,
    plus_radar: false,
    plus_notifications: false,
    plus_deadline_reminders: false,
    plus_saved_filters: false,
    plus_recommendations: false,
    plus_agenda: false,
  };
  if (!isSupabaseConfigured()) return flags;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("feature_flags").select("key,enabled");
  for (const row of data ?? []) if (row.key in flags) flags[row.key as FeatureFlagKey] = row.enabled;
  return flags;
});

/** Kategori yang berisi tugas/klaim — kebijakan: jangan pasang iklan di dekat alur tugas/reward. */
const NO_ADS_CATEGORIES: OpportunityCategory[] = ["giveaway", "paid_mission"];

/**
 * Iklan hanya boleh tampil bila: flag ads_enabled aktif, publisher ID diisi
 * (setelah disetujui Google), halaman tidak dikecualikan admin, listing tayang
 * dan berisiko rendah, serta bukan kategori tugas/klaim.
 */
export async function canShowAds(page: {
  adExcluded?: boolean;
  state?: string;
  riskLevel?: string;
  category?: OpportunityCategory;
}): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT) return false;
  const flags = await getFeatureFlags();
  if (!flags.ads_enabled) return false;
  if (page.adExcluded) return false;
  if (page.state && page.state !== "published") return false;
  if (page.riskLevel && page.riskLevel !== "low") return false;
  if (page.category && NO_ADS_CATEGORIES.includes(page.category)) return false;
  return true;
}

/** Entitlement Plus — selalu false sampai plus_enabled dinyalakan dan ada langganan aktif. */
export async function hasPlusAccess(userId: string | null | undefined): Promise<boolean> {
  if (!userId || !isSupabaseConfigured()) return false;
  const flags = await getFeatureFlags();
  if (!flags.plus_enabled) return false;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("valid_to", new Date().toISOString())
    .limit(1);
  return (data ?? []).length > 0;
}
