import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";
import type { Database } from "./database.types";

/**
 * Client Supabase untuk Server Components / Route Handlers yang hanya
 * membaca data. Pemanggil harus memastikan isSupabaseConfigured() di lib/data
 * sebelum memanggil ini.
 */
export async function createSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Supabase belum dikonfigurasi.");
  }
  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll dipanggil dari Server Component tanpa akses tulis cookie;
          // aman diabaikan karena proxy/middleware yang menangani refresh sesi.
        }
      },
    },
  });
}

export async function createSupabaseServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi di server.");
  }
  const { createClient } = await import("@supabase/supabase-js");
  return createClient<Database>(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}
