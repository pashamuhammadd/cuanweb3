import Link from "next/link";
import Image from "next/image";
import { LogOut, User } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth";

function Avatar({ url, className }: { url: string | null | undefined; className: string }) {
  return url ? (
    <Image src={url} alt="" width={24} height={24} className={`${className} rounded-full object-cover`} />
  ) : (
    <User className={className} aria-hidden />
  );
}

export async function AccountMenu() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          aria-label="Masuk"
          className="press inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gold/50 text-gold transition-colors hover:bg-gold/10 sm:hidden"
        >
          <User className="h-5 w-5" aria-hidden />
        </Link>
        <Link
          href="/login"
          className="press hidden h-10 items-center gap-2 rounded-lg border border-gold/60 px-4 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 sm:inline-flex"
        >
          <User className="h-4 w-4" aria-hidden />
          Masuk
        </Link>
      </>
    );
  }

  const label = user.profile?.username ?? "Akun";
  const avatar = user.profile?.avatar_url;

  return (
    <>
      <Link
        href="/akun"
        aria-label={`Akun ${label}`}
        className="press inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border-faint text-offwhite transition-colors hover:border-champagne/50 sm:hidden"
      >
        <Avatar url={avatar} className="h-5 w-5" />
      </Link>
      <div className="hidden items-center gap-1 sm:flex">
        <Link
          href="/akun"
          className="press flex h-10 max-w-48 items-center gap-2 rounded-xl border border-border-faint px-3 text-sm font-medium text-offwhite transition-colors hover:border-champagne/50 hover:text-champagne"
        >
          <Avatar url={avatar} className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-surface-raised hover:text-rose-300"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            <span className="sr-only">Keluar</span>
          </button>
        </form>
      </div>
    </>
  );
}
