import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ensureProfile } from "@/lib/actions/ensure-profile";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirect") || "/akun";

  if (!code || !isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  if (data.user) {
    await ensureProfile(supabase, data.user.id, data.user.email ?? null);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
