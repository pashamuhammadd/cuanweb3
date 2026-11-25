"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  FileText,
  Handshake,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Settings,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string; icon: LucideIcon; soon?: boolean };

const NAV: Item[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/opportunities", label: "Peluang", icon: ListChecks },
  { href: "/admin/automation", label: "Automation", icon: Bot },
  { href: "/admin/articles", label: "Artikel", icon: FileText },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/campaigns", label: "Campaign", icon: Megaphone, soon: true },
  { href: "/admin/submissions", label: "Submission", icon: Inbox, soon: true },
  { href: "/admin/sponsors", label: "Sponsor", icon: Handshake, soon: true },
  { href: "/admin/payouts", label: "Payout", icon: Wallet, soon: true },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings, soon: true },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Navigasi admin" className="no-scrollbar relative -mx-4 overflow-x-auto px-4 md:mx-0 md:w-52 md:shrink-0 md:px-0">
      <ul className="flex gap-1.5 md:sticky md:top-[calc(var(--header-h)+1rem)] md:flex-col">
        {NAV.map(({ href, label, icon: Icon, soon }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition-colors",
                  active ? "bg-gold/12 text-gold ring-1 ring-gold/30" : "text-offwhite/75 hover:bg-surface hover:text-offwhite",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
                {soon && <span className="ml-auto rounded bg-surface-raised px-1.5 py-0.5 text-[10px] text-muted-foreground">Segera</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
