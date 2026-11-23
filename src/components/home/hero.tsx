"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden border-b border-border-subtle bg-gradient-to-b from-petrol/40 to-background">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-6 px-4 py-10 md:grid-cols-2 md:px-6 md:py-16">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 order-2 md:order-1"
        >
          <h1 className="font-heading text-3xl font-extrabold leading-tight sm:text-4xl md:text-5xl">
            <span className="text-offwhite">Temukan peluang.</span>
            <br />
            <span className="text-gold">Raih cuan.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            Airdrop, kontes, pekerjaan dan pendanaan Web3 dalam satu tempat.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/peluang"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.02] active:scale-95"
            >
              Mulai cari cuan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-border-strong px-5 py-3 text-sm font-semibold text-offwhite transition-colors hover:border-teal hover:text-teal"
            >
              Buat akun gratis
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="relative order-1 mx-auto w-full max-w-sm md:order-2 md:max-w-none"
        >
          <motion.div
            animate={prefersReducedMotion ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative aspect-square md:aspect-[4/3]"
          >
            <Image
              src="/assets/cua/hero.png"
              alt="Maskot CUA, rubah fennec CuanWeb3, duduk di atap kota sambil memegang ponsel"
              fill
              sizes="(min-width: 768px) 50vw, 90vw"
              className="hidden object-contain object-right md:block"
              priority
            />
            <Image
              src="/assets/cua/welcome.png"
              alt="Maskot CUA menyambut pengguna CuanWeb3"
              fill
              sizes="90vw"
              className="object-contain md:hidden"
              priority
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
