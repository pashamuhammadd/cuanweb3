import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

function slugifyUsername(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/@.*/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "pengguna";
}

/**
 * Membuat profil otomatis setelah login Google pertama kali (idempotent).
 * Jika username dasar sudah dipakai, tambahkan suffix dari sebagian user id.
 */
export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  email: string | null,
) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return;

  const base = slugifyUsername(email ?? `user-${userId.slice(0, 8)}`);
  const username = `${base}-${userId.slice(0, 6)}`;

  await supabase.from("profiles").insert({
    id: userId,
    username,
    locale: "id",
  });
}
