"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigasi utama" className="hidden lg:flex lg:items-center lg:gap-1">
      {PRIMARY_NAV.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative rounded-full px-3 py-2 text-sm font-medium transition-colors",
              active ? "text-gold" : "text-offwhite/80 hover:text-offwhite",
            )}
          >
            {item.label}
            {active && (
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold transition-all" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
