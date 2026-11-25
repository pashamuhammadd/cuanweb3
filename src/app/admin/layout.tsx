import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};


export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <h1 className="font-heading text-xl font-bold text-offwhite">
          Supabase belum dikonfigurasi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Panel admin memerlukan Supabase dan akun dengan is_admin = true. Lihat
          README.md untuk instruksi setup.
        </p>
      </div>
    );
  }

  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/admin");
  if (!user.profile?.is_admin) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <h1 className="font-heading text-xl font-bold text-offwhite">Akses ditolak</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Akun kamu belum memiliki hak admin. Hubungi pemilik platform.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-4 py-5 md:flex-row md:gap-8 md:px-6 md:py-8">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
