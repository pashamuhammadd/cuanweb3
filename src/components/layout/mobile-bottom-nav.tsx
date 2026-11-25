"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOBILE_BOTTOM_NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border-subtle bg-charcoal/95 backdrop-blur [padding-bottom:env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-[1440px] items-stretch justify-between px-2">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  active ? "text-gold" : "text-offwhite/70",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
