import Link from "next/link";
import type { CSSProperties } from "react";
import { HOME_CATEGORIES } from "@/lib/nav";

const pad = (n: number) => String(n).padStart(2, "0");

export function CategoryGrid() {
  return (
    <section aria-labelledby="kategori-heading" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6">
      <h2 id="kategori-heading" className="sr-only">
        Kategori peluang
      </h2>
      <ol className="grid grid-cols-3 gap-3 md:grid-cols-6 md:gap-4">
        {HOME_CATEGORIES.map((category, i) => {
          const Icon = category.icon;
          const style = {
            "--glow-delay": `${-1.3 * i}s`,
            "--glow-speed": `${6 + (i % 3)}s`,
          } as CSSProperties;
          return (
            <li key={category.slug} className="glow-frame" style={style}>
              <Link
                href={category.href}
                className="group relative z-0 m-px flex h-[calc(100%-2px)] flex-col items-center gap-2 overflow-hidden rounded-[13px] bg-surface p-3 text-center transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold md:p-4"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-2 top-2 font-mono text-[0.58rem] text-gold/70 md:text-[0.65rem]"
                >
                  {pad(i + 1)}
                </span>
                <div
                  aria-hidden="true"
                  className="relative flex h-14 w-14 items-center justify-center md:h-16 md:w-16"
                >
                  <div className="absolute inset-[-30%] opacity-60 [background-image:radial-gradient(#25403d_1px,transparent_1px)] [background-size:8px_8px] [mask-image:radial-gradient(closest-side,#000,transparent)]" />
                  <div className="absolute inset-0 rounded-full border border-border-subtle" />
                  <div className="absolute inset-[18%] rounded-full border border-gold/40 transition-colors group-hover:border-gold/80" />
                  <Icon
                    className="relative h-6 w-6 text-gold transition-transform duration-500 group-hover:scale-110 md:h-7 md:w-7"
                    strokeWidth={1.6}
                  />
                </div>
                <span className="text-xs font-medium text-offwhite transition-colors group-hover:text-gold md:text-sm">
                  {category.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
