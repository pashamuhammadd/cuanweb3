import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;

  if (isSupabaseConfigured()) {
    const user = await getSessionUser();
    if (user) redirect(redirectTo || "/akun");
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
        Gunakan akun Google untuk menyimpan peluang, mengikuti campaign, dan
        mengelola profil kamu.
      </p>

      <div className="mt-8 w-full">
        {isSupabaseConfigured() ? (
          <GoogleLoginButton redirectTo={redirectTo} />
        ) : (
          <div className="rounded-xl border border-dashed border-border-subtle p-4 text-sm text-muted-foreground">
            Login Google belum aktif. Pemilik perlu mengonfigurasi
            NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, dan provider
            Google OAuth di proyek Supabase (lihat README.md).
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Satu akun Google terhubung ke satu akun CuanWeb3. Kami tidak pernah
        meminta seed phrase atau private key kamu.
      </p>
    </div>
  );
}
