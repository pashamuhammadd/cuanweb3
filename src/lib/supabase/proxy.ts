import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, isSupabaseConfigured } from "./config";
import type { Database } from "./database.types";

/**
 * Dipanggil dari proxy.ts (middleware) untuk me-refresh sesi Supabase pada
 * setiap request sehingga Server Components selalu membaca cookie terbaru.
 */
export async function updateSupabaseSession(request: NextRequest) {
  const response = NextResponse.next({ request });

  if (!isSupabaseConfigured() || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (
        cookiesToSet: { name: string; value: string; options: CookieOptions }[],
      ) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}
