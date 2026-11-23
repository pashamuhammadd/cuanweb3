import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/opportunities", label: "Peluang" },
  { href: "/admin/articles", label: "Artikel" },
  { href: "/admin/campaigns", label: "Campaign" },
  { href: "/admin/submissions", label: "Submission" },
  { href: "/admin/sponsors", label: "Sponsor" },
  { href: "/admin/payouts", label: "Payout" },
  { href: "/admin/users", label: "Pengguna" },
  { href: "/admin/settings", label: "Pengaturan" },
];

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
    <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-8 md:flex-row md:px-6">
      <nav
        aria-label="Navigasi admin"
        className="flex gap-2 overflow-x-auto border-b border-border-subtle pb-3 md:w-48 md:flex-col md:border-b-0 md:border-r md:pb-0 md:pr-4"
      >
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-offwhite/80 transition-colors hover:bg-surface hover:text-gold"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
