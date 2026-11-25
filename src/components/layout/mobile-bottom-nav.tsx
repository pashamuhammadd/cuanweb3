"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { MOBILE_BOTTOM_NAV, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function MobileBottomNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav
      aria-label="Navigasi bawah"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border-faint bg-charcoal/90 backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 pt-1.5 pb-1">
        {MOBILE_BOTTOM_NAV.map((item) => {
          const active = isNavActive(item.href, pathname);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press relative isolate flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[11px] font-medium transition-colors",
                  active ? "text-gold" : "text-offwhite/65 active:text-offwhite",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 38 }}
                    className="absolute inset-x-3 inset-y-0.5 -z-10 rounded-xl bg-gold/10"
                  />
                )}
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
