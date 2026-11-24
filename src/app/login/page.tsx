import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth";
import { GoogleLoginButton } from "@/components/auth/google-login-button";
import { EmailLoginForm } from "@/components/auth/email-login-form";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect: rawRedirect, error: errorCode } = await searchParams;
  const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";
  const errorMessage =
    errorCode === "link"
      ? "Link masuk sudah kedaluwarsa atau sudah dipakai. Minta link baru di bawah."
      : errorCode === "auth"
        ? "Gagal masuk. Coba lagi, dan buka link email di browser yang sama."
        : null;
  const redirectTo = rawRedirect ? safeRedirectPath(rawRedirect) : undefined;

  if (isSupabaseConfigured()) {
    const user = await getSessionUser();
    if (user) redirect(redirectTo ?? "/akun");
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center md:px-6">
      <div className="relative h-24 w-24">
        <Image src="/assets/cua/welcome.png" alt="" fill sizes="96px" className="object-contain" />
      </div>
      <h1 className="font-heading mt-4 text-2xl font-bold text-offwhite">
        Masuk ke CuanWeb3
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Masukkan email kamu, kami kirim link masuk tanpa password. Akun baru
        otomatis dibuat saat pertama kali masuk.
      </p>

      {errorMessage && (
        <p
          role="alert"
          className="mt-6 w-full rounded-xl border border-rose-400/40 bg-rose-400/10 p-3 text-left text-sm text-rose-200"
        >
          {errorMessage}
        </p>
      )}

      <div className="mt-8 w-full">
        {isSupabaseConfigured() ? (
          <>
            <EmailLoginForm redirectTo={redirectTo} />
            {googleEnabled && (
              <>
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border-subtle" />
                  atau
                  <span className="h-px flex-1 bg-border-subtle" />
                </div>
                <GoogleLoginButton redirectTo={redirectTo} />
              </>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
            Login belum aktif. Pemilik perlu mengisi NEXT_PUBLIC_SUPABASE_URL dan
            NEXT_PUBLIC_SUPABASE_ANON_KEY (lihat README.md).
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Satu email terhubung ke satu akun CuanWeb3. Kami tidak pernah meminta
        seed phrase atau private key kamu.
      </p>
    </div>
  );
}
