import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ensureProfile } from "@/lib/actions/ensure-profile";
import { safeRedirectPath } from "@/lib/safe-redirect";

const ALLOWED_TYPES: readonly EmailOtpType[] = ["email", "magiclink", "signup"];

/**
 * Verifikasi link email berbasis token_hash. Berbeda dengan /auth/callback
 * (PKCE `code`, harus dibuka di browser yang sama), alur ini tetap berfungsi
 * bila link dibuka di perangkat/browser lain. Butuh template email Supabase
 * yang mengarah ke:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const redirectTo = safeRedirectPath(searchParams.get("redirect"));

  if (!isSupabaseConfigured() || !tokenHash || !type || !ALLOWED_TYPES.includes(type)) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=link`);
  }

  if (data.user) {
    await ensureProfile(supabase, data.user.id, data.user.email ?? null);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
