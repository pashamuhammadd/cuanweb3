"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function GoogleLoginButton({ redirectTo }: { redirectTo?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      if (redirectTo) callbackUrl.searchParams.set("redirect", redirectTo);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl.toString() },
      });
      if (oauthError) {
        setError(oauthError.message);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memulai login.");
      setIsLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-offwhite px-5 py-3 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
      >
        {isLoading ? "Mengalihkan…" : "Masuk dengan Google"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}
