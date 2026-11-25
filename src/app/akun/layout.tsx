import type { Metadata } from "next";
import Image from "next/image";
import { User } from "lucide-react";
import { AccountTabs } from "@/components/account/account-tabs";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};

export default async function AkunLayout({ children }: LayoutProps<"/akun">) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <h1 className="font-heading text-xl font-bold text-offwhite">
          Supabase belum dikonfigurasi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman akun memerlukan login. Pemilik perlu mengisi kredensial
          Supabase di .env.local (lihat README.md).
        </p>
      </div>
    );
  }

  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/akun");

  const name = user.profile?.username ?? "Akun";

  return (
    <div className="mx-auto max-w-5xl px-4 py-5 md:px-6 md:py-8">
      <div className="card-surface flex items-center gap-4 p-4 md:p-5">
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-petrol ring-1 ring-border-subtle">
          {user.profile?.avatar_url ? (
            <Image src={user.profile.avatar_url} alt="" width={56} height={56} className="h-full w-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-teal" aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-lg font-bold text-offwhite">{name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <span className="hidden shrink-0 rounded-lg bg-surface-raised px-2.5 py-1 text-xs font-medium text-offwhite/80 sm:inline-flex">
          Member gratis · Plus segera hadir
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-5 md:mt-6 md:grid-cols-[200px_minmax(0,1fr)] md:gap-8">
        <AccountTabs />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
