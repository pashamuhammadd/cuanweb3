import { getSessionUser } from "@/lib/auth";
import { ProfileForm } from "@/components/account/profile-form";

export default async function AkunProfilePage() {
  const user = await getSessionUser();

  if (!user?.profile) {
    return (
      <p className="text-sm text-muted-foreground">
        Profil sedang disiapkan. Muat ulang halaman dalam beberapa saat.
      </p>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Profil saya</h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      <div className="mt-5">
        <ProfileForm profile={user.profile} />
      </div>
    </div>
  );
}
