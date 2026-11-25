import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

/** Teaser jujur: Plus belum aktif, tanpa tombol beli atau harga final. */
export function PlusPanel() {
  return (
    <section
      aria-labelledby="plus-heading"
      className="relative overflow-hidden rounded-2xl border border-gold/20 bg-[radial-gradient(80%_140%_at_100%_0%,rgba(244,189,53,0.16),transparent_60%),linear-gradient(180deg,#1b1f27,#171a21)] p-5 md:flex md:items-center md:justify-between md:gap-6 md:p-7"
    >
      <div>
        <p className="inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          CuanWeb3 Plus · Segera hadir
        </p>
        <h2 id="plus-heading" className="font-heading mt-2.5 text-xl font-bold text-offwhite md:text-2xl">
          Radar peluang, notifikasi, dan pengingat deadline
        </h2>
        <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">Fitur premium sedang disiapkan. Belum ada pembayaran yang dibuka.</p>
      </div>
      <Link
        href="/plus"
        className="press mt-4 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg border border-gold/50 px-4 text-sm font-semibold text-gold transition-colors hover:bg-gold/10 md:mt-0"
      >
        Lihat rencana Plus
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
