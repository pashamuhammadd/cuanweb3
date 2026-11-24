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

  // Constraint DB: ^[a-zA-Z0-9_-]{3,24}$. Suffix "-xxxxxx" = 7 karakter,
  // jadi base dipotong maks 17 karakter.
  const base =
    slugifyUsername(email ?? `user-${userId.slice(0, 8)}`)
      .slice(0, 17)
      .replace(/-+$/g, "") || "pengguna";
  const username = `${base}-${userId.replace(/-/g, "").slice(0, 6)}`;

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    username,
    locale: "id",
  });

  // 23505 = sudah dibuat oleh request paralel; aman diabaikan (idempotent).
  if (error && error.code !== "23505") {
    console.error("[ensureProfile] gagal membuat profil:", error.code, error.message);
  }
}
