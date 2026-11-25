import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Akun",
  robots: { index: false, follow: false },
};

const TABS = [
  { href: "/akun", label: "Profil" },
  { href: "/akun/aktivitas", label: "Aktivitas" },
  { href: "/akun/tersimpan", label: "Tersimpan" },
  { href: "/akun/pembayaran", label: "Pembayaran" },
];

export default async function AkunLayout({ children }: LayoutProps<"/akun">) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center md:px-6">
        <h1 className="font-heading text-xl font-bold text-offwhite">
          Supabase belum dikonfigurasi
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman akun memerlukan login. Pemilik perlu mengisi kredensial
          Supabase di .env.local — lihat README.md untuk instruksi.
        </p>
      </div>
    );
  }

  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/akun");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-6">
      <nav aria-label="Navigasi akun" className="flex gap-2 overflow-x-auto border-b border-border-subtle pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="shrink-0 rounded-full px-4 py-1.5 text-sm font-medium text-offwhite/80 transition-colors hover:text-gold"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-6">{children}</div>
    </div>
  );
}
