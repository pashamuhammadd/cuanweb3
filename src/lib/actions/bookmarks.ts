"use server";

import { revalidatePath } from "next/cache";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ToggleBookmarkResult =
  | { status: "ok"; bookmarked: boolean }
  | { status: "requires_login" }
  | { status: "not_configured" }
  | { status: "error"; message: string };

export async function toggleBookmark(opportunityId: string): Promise<ToggleBookmarkResult> {
  if (!isSupabaseConfigured()) {
    return { status: "not_configured" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "requires_login" };
  }

  const { data: existing, error: lookupError } = await supabase
    .from("bookmarks")
    .select("opportunity_id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (lookupError) {
    return { status: "error", message: lookupError.message };
  }

  if (existing) {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("opportunity_id", opportunityId);
    if (error) return { status: "error", message: error.message };
    revalidatePath("/akun/tersimpan");
    return { status: "ok", bookmarked: false };
  }

  const { error } = await supabase
    .from("bookmarks")
    .insert({ user_id: user.id, opportunity_id: opportunityId });
  if (error) return { status: "error", message: error.message };
  revalidatePath("/akun/tersimpan");
  return { status: "ok", bookmarked: true };
}

export async function isOpportunityBookmarked(opportunityId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from("bookmarks")
    .select("opportunity_id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  return Boolean(data);
}

export type MyBookmarksResult =
  | { status: "ok"; ids: string[] }
  | { status: "anonymous" }
  | { status: "not_configured" };

/** Read-only: ID peluang yang disimpan user saat ini (RLS membatasi ke milik sendiri). */
export async function listMyBookmarkIds(): Promise<MyBookmarksResult> {
  if (!isSupabaseConfigured()) return { status: "not_configured" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "anonymous" };

  const { data } = await supabase.from("bookmarks").select("opportunity_id").eq("user_id", user.id).limit(1000);
  return { status: "ok", ids: (data ?? []).map((r) => r.opportunity_id) };
}
