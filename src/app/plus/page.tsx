import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BellRing, BookOpen, CalendarCheck, Info, ListChecks, Radar, Sparkles, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "CuanWeb3 Plus",
  description: "Fitur premium CuanWeb3 yang sedang disiapkan: radar peluang, notifikasi, dan pengingat deadline.",
  alternates: { canonical: "/plus" },
};

const PLANNED = [
  { icon: Radar, title: "Radar peluang pribadi", desc: "Peluang yang cocok dengan skill dan ekosistem pilihanmu." },
  { icon: Zap, title: "Info lebih cepat", desc: "Notifikasi saat peluang baru tayang." },
  { icon: CalendarCheck, title: "Pengingat deadline", desc: "Agenda dan pengingat sebelum peluang ditutup." },
  { icon: ListChecks, title: "Filter tersimpan", desc: "Simpan kombinasi filter dan checklist persiapan." },
  { icon: BookOpen, title: "Panduan eksklusif", desc: "Konten dan template dari komunitas." },
  { icon: BellRing, title: "Kurasi pilihan", desc: "Peluang terkurasi dengan pengecekan tambahan." },
];

export default function PlusPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-5 md:px-6 md:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-gold/25 bg-[radial-gradient(100%_120%_at_100%_0%,rgba(244,189,53,0.18),transparent_55%),linear-gradient(160deg,#102b2b,#0f161d)] p-6 md:p-10">
        <p className="inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Segera hadir
        </p>
        <h1 className="font-heading mt-3 max-w-lg text-3xl font-extrabold text-offwhite md:text-4xl">CuanWeb3 Plus</h1>
        <p className="mt-3 max-w-lg text-base text-offwhite/80">
          Fitur premium untuk berburu peluang lebih rapi. Rencana harga Rp10.000 per 30 hari, masih dalam tahap persiapan.
        </p>
        <p role="note" className="mt-5 flex max-w-lg items-start gap-2 rounded-xl border border-border-subtle bg-charcoal/50 p-3 text-sm text-offwhite/80">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
          Pembayaran belum dibuka. Tidak ada transaksi yang diproses dari halaman ini.
        </p>
        <Image
          src="/assets/cua/plus.png"
          alt=""
          width={220}
          height={220}
          priority
          className="pointer-events-none absolute -right-4 -bottom-4 hidden h-52 w-52 object-contain sm:block md:h-60 md:w-60"
        />
      </section>

      <h2 className="font-heading mt-8 text-lg font-bold text-offwhite md:text-xl">Yang sedang disiapkan</h2>
      <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {PLANNED.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="card-surface p-4 md:p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/12 text-gold">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="font-heading mt-3 font-semibold text-offwhite">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        CuanWeb3 Plus tidak mengubah peluang menang giveaway atau undian. Kami tidak menjanjikan pendapatan dari fitur apa pun.
      </p>
      <Link
        href="/peluang"
        className="press mt-4 inline-flex h-11 items-center rounded-xl border border-border-strong px-4 text-sm font-semibold text-offwhite hover:border-teal hover:text-teal"
      >
        Jelajahi peluang gratis
      </Link>
    </div>
  );
}
