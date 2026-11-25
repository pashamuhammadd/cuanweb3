"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "motion/react";
import { PRIMARY_NAV, isNavActive } from "@/lib/nav";
import { cn } from "@/lib/cn";

export function DesktopNav() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <nav aria-label="Navigasi utama" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative isolate inline-flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors",
                  active ? "text-gold" : "text-offwhite/70 hover:bg-surface hover:text-offwhite",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                    className="absolute inset-0 -z-10 rounded-lg bg-surface-raised ring-1 ring-border-subtle"
                  />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
