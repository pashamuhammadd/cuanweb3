"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, CreditCard, History, UserRound } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/akun", label: "Profil", icon: UserRound },
  { href: "/akun/tersimpan", label: "Tersimpan", icon: Bookmark },
  { href: "/akun/aktivitas", label: "Aktivitas", icon: History },
  { href: "/akun/pembayaran", label: "Pembayaran", icon: CreditCard },
];

export function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi akun" className="no-scrollbar relative -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex gap-1.5 md:flex-col">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors md:h-11",
                  active ? "bg-gold/12 text-gold ring-1 ring-gold/30" : "text-offwhite/75 hover:bg-surface hover:text-offwhite",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
