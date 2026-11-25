import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Misi berbayar",
  description: "Panel tester, feedback terstruktur, dan misi berbayar dari sponsor.",
  alternates: { canonical: "/misi" },
};

export default function MisiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center md:px-6">
      <div className="relative mx-auto h-20 w-20">
        <Image src="/assets/cua/grants.png" alt="" fill sizes="80px" className="object-contain" />
      </div>
      <h1 className="font-heading mt-4 text-2xl font-bold text-offwhite">Misi berbayar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Panel tester produk/game, feedback terstruktur, dan slot misi berbayar
        dari sponsor akan hadir di sini.
      </p>
      <p className="mt-6 rounded-2xl border border-dashed border-border-subtle p-8 text-sm text-muted-foreground">
        Fitur ini direncanakan pada Fase 3 — Misi dan komunitas (lihat
        docs/ROADMAP.md). Slot reservasi, review, dan pembayaran akan
        transparan dan terkontrol sebelum tayang ke publik.
      </p>
    </div>
  );
}
