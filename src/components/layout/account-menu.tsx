import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

export async function AccountMenu() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden rounded-full border border-border-strong px-4 py-2 text-sm font-medium text-offwhite transition-colors hover:border-teal hover:text-teal sm:inline-flex"
      >
        Masuk
      </Link>
    );
  }

  const label = user.profile?.username ?? "Akun";

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/akun"
        className="flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-sm font-medium text-offwhite transition-colors hover:border-teal hover:text-teal"
      >
        {user.profile?.avatar_url ? (
          <Image
            src={user.profile.avatar_url}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 rounded-full object-cover"
          />
        ) : (
          <User className="h-4 w-4" aria-hidden />
        )}
        {label}
      </Link>
      <form action={signOut}>
        <button
          type="submit"
          className="rounded-full px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-rose-400"
        >
          Keluar
        </button>
      </form>
    </div>
  );
}
