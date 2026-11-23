import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

const BENEFITS = [
  "Peluang premium & kurasi",
  "Info lebih cepat & prioritas",
  "Konten & panduan eksklusif",
];

export function PlusPanel() {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-gold/30 bg-gradient-to-br from-petrol to-surface p-5">
      <div>
        <span className="inline-flex items-center rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-gold">
          CuanWeb3 Plus
        </span>
        <h3 className="font-heading mt-3 text-xl font-bold text-offwhite">
          Level up peluangmu
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Akses lebih banyak peluang pilihan, prioritas info, dan konten
          eksklusif komunitas.
        </p>

        <ul className="mt-4 space-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-offwhite/90">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              {b}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <Link
          href="/plus"
          className="inline-flex items-center justify-center rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.02] active:scale-95"
        >
          Gabung Plus — Rp10.000/bulan
        </Link>
        <div className="relative hidden h-16 w-16 shrink-0 sm:block">
          <Image src="/assets/cua/plus.png" alt="" fill sizes="64px" className="object-contain" />
        </div>
      </div>
    </div>
  );
}
