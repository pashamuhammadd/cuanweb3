import Image from "next/image";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import type { OpportunityCategory } from "@/lib/supabase/database.types";
import { CATEGORY_LABELS } from "@/lib/categories";
import { CategoryIcon } from "@/components/category/category-icon";

type Chip = { category: OpportunityCategory; count: number };

/** Posisi chip di area gelap kiri ilustrasi agar tidak menutupi CUA. */
const CHIP_POS = [
  "left-[0%] top-[12%] motion-safe:animate-float-slow",
  "left-[24%] top-[44%] motion-safe:animate-float-alt [animation-delay:-5s]",
  "left-[4%] bottom-[8%] motion-safe:animate-float-alt [animation-delay:-3s]",
];

/**
 * Hero DESKTOP saja (≥1024px; mobile/tablet langsung ke kategori). Komposisi animasi dengan CSS:
 * ilustrasi resmi CUA bergeser sangat pelan (loop alternate, tanpa distorsi),
 * cahaya teal/gold melayang, garis jaringan blockchain mengalir, dan chip
 * kategori berisi jumlah peluang asli. Semua loop berhenti di reduced motion.
 */
export function Hero({ total, chips }: { total: number; chips: Chip[] }) {
  return (
    <section aria-labelledby="hero-heading" className="relative hidden overflow-hidden border-b border-border-faint lg:block">
      {/* Lapisan ilustrasi */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-y-0 right-0 w-[68%] motion-safe:animate-pan">
          <Image
            src="/assets/cua/hero.png"
            alt=""
            fill
            priority
            sizes="(min-width: 1440px) 980px, 68vw"
            className="object-cover object-[70%_40%]"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0c1117_0%,#0c1117_34%,rgba(12,17,23,0.75)_52%,rgba(12,17,23,0)_78%)]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal/25 blur-3xl motion-safe:animate-drift" />
        <div className="absolute left-[38%] -bottom-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl motion-safe:animate-drift [animation-delay:-9s]" />

        {/* Jaringan blockchain */}
        <svg className="absolute inset-y-0 left-[30%] h-full w-[45%] opacity-60" viewBox="0 0 400 300" fill="none" preserveAspectRatio="none">
          <g stroke="rgba(37,140,131,0.55)" strokeWidth="1" strokeDasharray="4 8" className="motion-safe:animate-dash">
            <path d="M10 60 L120 110 L230 70 L340 140" />
            <path d="M40 230 L150 190 L260 240 L380 200" />
            <path d="M120 110 L150 190" />
            <path d="M230 70 L260 240" />
          </g>
          <g fill="#f4bd35">
            {[
              [10, 60],
              [120, 110],
              [230, 70],
              [340, 140],
              [40, 230],
              [150, 190],
              [260, 240],
              [380, 200],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="3"
                className="origin-center motion-safe:animate-pulse-dot [transform-box:fill-box]"
                style={{ animationDelay: `${-i * 0.3}s` }}
              />
            ))}
          </g>
        </svg>
      </div>

      <div className="relative mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-8 px-6 py-14 lg:py-20">
        <div className="motion-safe:animate-fade-up">
          <p className="inline-flex items-center gap-2 rounded-lg border border-border-subtle bg-surface/70 px-2.5 py-1 text-xs font-medium text-teal backdrop-blur">
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Diperbarui otomatis dari sumber resmi
          </p>
          <h1 id="hero-heading" className="font-heading mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight lg:text-[56px]">
            <span className="text-offwhite">Temukan peluang.</span>
            <br />
            <span className="text-gold">Raih cuan.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-offwhite/75">
            Airdrop, kontes, lowongan kerja, dan pendanaan Web3 dalam satu tempat. Diringkas dalam bahasa Indonesia.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/peluang"
              className="press glow-gold inline-flex h-12 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-charcoal transition-[filter] hover:brightness-105"
            >
              Mulai cari cuan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="press inline-flex h-12 items-center rounded-xl border border-border-strong bg-surface/60 px-5 text-sm font-semibold text-offwhite backdrop-blur transition-colors hover:border-teal hover:text-teal"
            >
              Buat akun gratis
            </Link>
          </div>
          {total > 0 && (
            <p className="mt-6 text-sm text-muted-foreground">
              <span className="font-mono font-semibold text-offwhite tabular-nums-fixed">{total}</span> peluang aktif saat ini
            </p>
          )}
        </div>

        <div className="relative h-[340px] lg:h-[380px]" aria-hidden>
          {chips.slice(0, 3).map((chip, i) => (
            <div
              key={chip.category}
              className={`absolute flex items-center gap-2.5 rounded-xl border border-white/10 bg-charcoal/70 py-2 pr-4 pl-2 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.8)] backdrop-blur-md ${CHIP_POS[i]}`}
            >
              <CategoryIcon category={chip.category} size="sm" />
              <div className="leading-tight">
                <p className="text-sm font-semibold text-offwhite">{CATEGORY_LABELS[chip.category]}</p>
                <p className="font-mono text-xs text-muted-foreground tabular-nums-fixed">{chip.count} peluang</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
