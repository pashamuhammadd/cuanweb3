import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import type { OpportunityCategory } from "@/types/opportunity";
import { HOME_CATEGORIES } from "@/lib/nav";

/** Label kecil di atas judul kartu. */
const EYEBROW: Partial<Record<OpportunityCategory, string>> = {
  airdrop: "Distribusi token",
  giveaway: "Hadiah komunitas",
  bounty: "Tugas berhadiah",
  jobs: "Karier Web3",
  hackathon: "Kompetisi builder",
  grants: "Pendanaan proyek",
};

const pad = (n: number) => String(n).padStart(2, "0");

export function CategoryGrid() {
  const total = HOME_CATEGORIES.length;

  return (
    <section aria-labelledby="kategori-heading" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-12">
      <div className="flex items-baseline justify-between gap-4">
        <h2
          id="kategori-heading"
          className="font-mono text-sm font-semibold uppercase tracking-[0.14em] text-offwhite"
        >
          Kategori peluang
        </h2>
        <span className="font-mono text-xs text-muted-foreground">{pad(total)} kategori</span>
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 lg:gap-6">
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
                className="group relative z-0 m-px flex h-[calc(100%-2px)] flex-col overflow-hidden rounded-[13px] bg-surface transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                {/* Pratinjau: pola titik, sapuan conic, cincin, dan ikon kategori. */}
                <div
                  aria-hidden="true"
                  className="relative flex aspect-[16/9] items-center justify-center overflow-hidden border-b border-border-subtle bg-[#0f161c]"
                >
                  <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(#25403d_1px,transparent_1px)] [background-size:14px_14px] [mask-image:radial-gradient(closest-side,#000,transparent)]" />
                  <div
                    className="absolute h-[140%] w-[140%] opacity-70 transition-transform duration-700 group-hover:rotate-12"
                    style={{
                      background: `conic-gradient(from ${(53 * i) % 360}deg at 50% 50%, transparent 0deg, rgba(244,189,53,0.18) 40deg, transparent 90deg)`,
                    }}
                  />
                  <div className="absolute h-20 w-20 rounded-full border border-border-subtle sm:h-28 sm:w-28" />
                  <div className="absolute h-14 w-14 rounded-full border border-gold/40 sm:h-20 sm:w-20" />
                  <Icon
                    className="relative h-7 w-7 text-gold transition-transform duration-500 group-hover:scale-110 sm:h-10 sm:w-10"
                    strokeWidth={1.6}
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-charcoal/80 px-2 py-0.5 font-mono text-[0.6rem] text-gold backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[0.68rem]">
                    {pad(i + 1)} / {pad(total)}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <p className="font-mono text-[0.62rem] text-[#3fc1b4] sm:text-[0.75rem]">
                    {EYEBROW[category.slug] ?? "Peluang Web3"}
                  </p>
                  <h3 className="mt-0.5 font-heading text-base font-bold leading-tight tracking-tight text-offwhite transition-colors group-hover:text-gold sm:mt-1 sm:text-[1.4rem]">
                    {category.label}
                  </h3>
                  <p className="mt-1.5 line-clamp-3 font-mono text-[0.68rem] leading-relaxed text-muted-foreground sm:mt-2 sm:line-clamp-none sm:text-[0.8rem]">
                    {category.description}
                  </p>
                  <span className="mt-auto flex items-center justify-between gap-2 pt-3 font-mono text-[0.62rem] text-muted-foreground sm:pt-4 sm:text-xs">
                    <span className="truncate">cuanweb3.com{category.href}</span>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border-strong text-gold transition-colors group-hover:border-gold group-hover:bg-gold group-hover:text-charcoal sm:h-8 sm:w-8">
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
