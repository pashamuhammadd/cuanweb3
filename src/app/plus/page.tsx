import type { Metadata } from "next";
import Image from "next/image";
import { Check, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "CuanWeb3 Plus",
  description: "Fitur premium CuanWeb3 untuk prioritas info dan konten eksklusif.",
  alternates: { canonical: "/plus" },
};

const BENEFITS = [
  "Peluang premium & kurasi",
  "Info lebih cepat & prioritas",
  "Konten & panduan eksklusif",
  "Halaman Radar Peluang Pribadi",
  "Pengingat deadline & agenda",
  "Filter profil tersimpan & checklist/template",
];

export default function PlusPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <Image src="/assets/cua/plus.png" alt="" fill sizes="64px" className="object-contain" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-offwhite">CuanWeb3 Plus</h1>
          <p className="text-sm text-muted-foreground">Rp10.000 / 30 hari (rancangan)</p>
        </div>
      </div>

      <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-dashed border-border-subtle px-4 py-3 text-sm text-muted-foreground">
        <Clock className="h-4 w-4 shrink-0" aria-hidden />
        Pembayaran Plus belum aktif. Daftar manfaat final dan mekanisme
        pembayaran masih menunggu persetujuan pemilik — tidak ada transaksi
        riil yang diproses dari halaman ini.
      </div>

      <ul className="mt-6 space-y-3">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-offwhite/90">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
            {benefit}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs text-muted-foreground">
        CuanWeb3 Plus tidak mengubah peluang menang giveaway atau undian.
        Kami tidak menjanjikan return atau pendapatan pasti dari fitur apa pun.
      </p>
    </div>
  );
}
