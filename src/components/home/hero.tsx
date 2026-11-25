import { ArrowRight, CalendarDays, ChevronDown, Filter, Search } from "lucide-react";
import { CATEGORIES } from "@/lib/nav";

const selectClass =
  "h-12 w-full appearance-none rounded-lg border border-border-subtle bg-surface/90 pr-9 pl-10 text-sm text-offwhite transition-colors hover:border-border-strong focus:border-gold/60";

/**
 * Hero DESKTOP saja (≥1024px). Mobile/tablet tidak merender hero sama sekali
 * sehingga tidak ada ruang kosong. Komposisi tipografi + form cari yang benar
 * (GET ke /peluang) + gradasi gold di kanan yang bergerak pelan lewat CSS.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate hidden overflow-hidden border-b border-border-faint lg:block">
      {/* Gradasi gold/champagne, tidak interaktif, mati saat reduced motion */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#141821_0%,#0c1117_100%)]" />
        <div className="hero-glow top-[-30%] right-[-8%] h-[140%] w-[46%] bg-[radial-gradient(closest-side,rgba(244,189,53,0.5),rgba(233,188,101,0.2)_55%,transparent)] motion-safe:animate-hero-glow" />
        {/* Busur cahaya champagne seperti referensi C */}
        <div className="absolute top-[-60%] right-[-12%] h-[190%] w-[52%] rounded-full border-l-[3px] border-champagne/50 opacity-70 blur-[3px] motion-safe:animate-hero-glow-alt" />
        <div className="hero-glow right-[18%] bottom-[-55%] h-[110%] w-[34%] bg-[radial-gradient(closest-side,rgba(233,188,101,0.22),transparent)] motion-safe:animate-hero-glow-alt" />
        <div className="absolute inset-y-0 left-0 w-[55%] bg-[linear-gradient(90deg,#0c1117_25%,transparent)] opacity-80" />
      </div>

      <div className="mx-auto max-w-[1440px] px-10 py-12 xl:py-14">
        <h1 id="hero-heading" className="font-heading text-[44px] leading-[1.05] font-extrabold tracking-tight text-offwhite xl:text-[54px]">
          Temukan peluang. <span className="text-gold">Raih cuan.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-offwhite/80">
          Marketplace peluang di ekosistem Web3. Temukan airdrop, giveaway, bounty, kontes, lowongan kerja, hingga hackathon dalam
          satu tempat.
        </p>

        <form action="/peluang" method="get" role="search" aria-label="Cari peluang" className="mt-7 flex max-w-5xl items-center gap-3">
          <div className="relative min-w-0 flex-[2.2]">
            <label htmlFor="hero-q" className="sr-only">
              Kata kunci
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="hero-q"
              name="q"
              type="search"
              placeholder="Cari peluang (mis. airdrop, kontes, developer)"
              className="h-12 w-full rounded-lg border border-border-subtle bg-surface/90 pr-4 pl-11 text-sm text-offwhite placeholder:text-muted-foreground transition-colors hover:border-border-strong focus:border-gold/60"
            />
          </div>
          <div className="relative min-w-44 flex-1">
            <label htmlFor="hero-kategori" className="sr-only">
              Kategori
            </label>
            <Filter className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <select id="hero-kategori" name="kategori" defaultValue="" className={selectClass}>
              <option value="">Semua kategori</option>
              {CATEGORIES.filter((c) => !c.includes).map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          </div>
          <div className="relative min-w-44 flex-1">
            <label htmlFor="hero-deadline" className="sr-only">
              Deadline
            </label>
            <CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <select id="hero-deadline" name="deadline" defaultValue="" className={selectClass}>
              <option value="">Semua deadline</option>
              <option value="dekat">Deadline 14 hari ke depan</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          </div>
          <button
            type="submit"
            className="press inline-flex h-12 shrink-0 items-center gap-2 rounded-lg bg-gold px-5 text-sm font-semibold text-charcoal transition-[filter] hover:brightness-105"
          >
            Jelajahi peluang
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>
      </div>
    </section>
  );
}
