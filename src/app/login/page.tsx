import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Bookmark, BellRing, ShieldCheck } from "lucide-react";
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
    <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 px-4 py-8 md:grid-cols-2 md:gap-12 md:px-6 md:py-16">
      <section aria-labelledby="manfaat-heading" className="order-2 md:order-1">
        <h2 id="manfaat-heading" className="font-heading text-lg font-bold text-offwhite md:text-xl">
          Kenapa punya akun CuanWeb3?
        </h2>
        <ul className="mt-4 space-y-3">
          {[
            { icon: Bookmark, title: "Simpan peluang", desc: "Tandai peluang menarik dan buka lagi kapan saja." },
            { icon: BellRing, title: "Siap untuk fitur berikutnya", desc: "Pengingat deadline dan radar peluang akan memakai akunmu." },
            { icon: ShieldCheck, title: "Tanpa password, tanpa wallet", desc: "Masuk lewat link email. Kami tidak pernah meminta seed phrase." },
          ].map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span>
                <span className="block font-semibold text-offwhite">{title}</span>
                <span className="block text-sm text-muted-foreground">{desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="card-surface order-1 p-5 md:order-2 md:p-7">
        <div className="flex items-center gap-3">
          <Image src="/assets/cua/welcome.png" alt="" width={56} height={56} className="h-14 w-14 object-contain" />
          <div>
            <h1 className="font-heading text-2xl font-bold text-offwhite">Masuk ke CuanWeb3</h1>
            <p className="text-sm text-muted-foreground">Akun baru dibuat otomatis.</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-offwhite/80">Masukkan email kamu, kami kirim link masuk tanpa password.</p>

        {errorMessage && (
          <p role="alert" className="mt-4 w-full rounded-xl border border-rose-400/40 bg-rose-400/10 p-3 text-left text-sm text-rose-200">
            {errorMessage}
          </p>
        )}

        <div className="mt-5 w-full">
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
              Login belum aktif. Pemilik perlu mengisi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY (lihat README.md).
            </div>
          )}
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Satu email terhubung ke satu akun CuanWeb3. Kami tidak pernah meminta seed phrase atau private key kamu.
        </p>
      </div>
    </div>
  );
}
