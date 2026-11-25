import Image from "next/image";
import Link from "next/link";
import { BellRing, CalendarCheck, Radar, Sparkles } from "lucide-react";

const PLANNED = [
  { icon: Radar, text: "Radar peluang sesuai skill dan ekosistem" },
  { icon: BellRing, text: "Notifikasi peluang baru lebih cepat" },
  { icon: CalendarCheck, text: "Pengingat deadline dan agenda" },
];

/** Teaser jujur: Plus belum aktif, tidak ada tombol beli. */
export function PlusPanel() {
  return (
    <section
      aria-labelledby="plus-heading"
      className="relative overflow-hidden rounded-2xl border border-gold/25 bg-[radial-gradient(120%_100%_at_100%_0%,rgba(244,189,53,0.14),transparent_55%),linear-gradient(160deg,#102b2b,#121a22)] p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-md bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            CuanWeb3 Plus · Segera hadir
          </p>
          <h2 id="plus-heading" className="font-heading mt-3 text-xl font-bold text-offwhite">
            Level up peluangmu
          </h2>
        </div>
        <Image src="/assets/cua/plus.png" alt="" width={72} height={72} className="h-16 w-16 shrink-0 object-contain md:h-[72px] md:w-[72px]" />
      </div>
      <p className="mt-2 text-sm text-offwhite/75">Fitur premium sedang disiapkan. Belum ada pembayaran yang dibuka.</p>
      <ul className="mt-4 space-y-2.5">
        {PLANNED.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-offwhite/90">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
      <Link
        href="/plus"
        className="press mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl border border-gold/40 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
      >
        Lihat rencana Plus
      </Link>
    </section>
  );
}
