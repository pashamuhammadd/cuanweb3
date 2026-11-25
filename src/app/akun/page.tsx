import { getSessionUser } from "@/lib/auth";
import Link from "next/link";
import { Bookmark, Crown } from "lucide-react";
import { ProfileForm } from "@/components/account/profile-form";
import { listBookmarkedOpportunities } from "@/lib/data/bookmarks";

export default async function AkunProfilePage() {
  const user = await getSessionUser();

  if (!user?.profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Profil sedang disiapkan. Muat ulang halaman dalam beberapa saat.
      </p>
    );
  }

  const saved = await listBookmarkedOpportunities(user.id);

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Profil saya</h1>

      <ul className="mt-4 grid grid-cols-2 gap-3">
        <li>
          <Link href="/akun/tersimpan" className="card-surface card-interactive press flex h-full flex-col p-4">
            <Bookmark className="h-5 w-5 text-gold" aria-hidden />
            <span className="mt-2 font-mono text-2xl font-semibold text-offwhite tabular-nums-fixed">{saved.length}</span>
            <span className="text-sm text-muted-foreground">Peluang tersimpan</span>
          </Link>
        </li>
        <li>
          <Link href="/plus" className="card-surface card-interactive press flex h-full flex-col p-4">
            <Crown className="h-5 w-5 text-gold" aria-hidden />
            <span className="mt-2 text-base font-semibold text-offwhite">Gratis</span>
            <span className="text-sm text-muted-foreground">Status membership. Plus segera hadir.</span>
          </Link>
        </li>
      </ul>

      <h2 className="font-heading mt-6 text-lg font-semibold text-offwhite">Preferensi</h2>
      <div className="mt-3">
        <ProfileForm profile={user.profile} />
      </div>
    </div>
  );
}
