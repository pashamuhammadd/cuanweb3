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
    <nav aria-label="Navigasi utama" className="hidden lg:block">
      <ul className="flex items-center gap-2">
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(item.href, pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-16 items-center px-3 text-[15px] font-medium transition-colors",
                  active ? "text-gold" : "text-offwhite/75 hover:text-offwhite",
                )}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="desktop-nav-active"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 40 }}
                    className="absolute inset-x-3 bottom-3 h-0.5 rounded-full bg-gold"
                    aria-hidden
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
