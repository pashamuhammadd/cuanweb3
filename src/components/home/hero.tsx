"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HeroMotion } from "./hero-motion";
import { DecodeText, TypedCommand } from "./hero-text-effects";

const TYPED_CATEGORIES = ["airdrop", "bounty", "web3-jobs", "grants", "hackathon", "testnet"];

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-gradient-to-b from-petrol/40 to-background">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10"
        >
          <p className="font-mono text-xs tracking-wide text-teal sm:text-sm">
            {"// Peluang Web3 untuk Indonesia"}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            <DecodeText text="Temukan peluang." className="text-offwhite" />
            <br />
            <DecodeText text="Raih cuan" delay={250} className="text-gold" />
            <span className="text-teal">.</span>
          </h1>
          <p className="mt-4 max-w-md font-mono text-sm leading-relaxed text-muted-foreground sm:text-base">
            <span aria-hidden="true" className="text-gold">
              &gt;{" "}
            </span>
            Airdrop, kontes, pekerjaan dan pendanaan Web3 dalam satu tempat.
          </p>
          <TypedCommand items={TYPED_CATEGORIES} />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/peluang"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-charcoal shadow-[0_0_30px_rgba(244,189,53,0.25)] transition-transform hover:scale-[1.02] active:scale-95"
            >
              Mulai cari cuan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-strong px-5 py-3 text-sm font-semibold text-offwhite transition-colors hover:border-teal hover:text-teal"
            >
              Buat akun gratis
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="relative mx-auto w-full max-w-md md:max-w-none"
        >
          <HeroMotion />
        </motion.div>
      </div>
    </section>
  );
}
