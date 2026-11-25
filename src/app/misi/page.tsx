import type { Metadata } from "next";
import { CategoryIcon } from "@/components/category/category-icon";

export const metadata: Metadata = {
  title: "Misi berbayar",
  description: "Panel tester, feedback terstruktur, dan misi berbayar dari sponsor.",
  alternates: { canonical: "/misi" },
};

export default function MisiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 text-center md:px-6">
      <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-elevated">
        <CategoryIcon category="paid_mission" size="lg" />
      </span>
      <h1 className="font-heading mt-4 text-2xl font-bold text-offwhite">Misi berbayar</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Panel tester produk/game, feedback terstruktur, dan slot misi berbayar
        dari sponsor akan hadir di sini.
      </p>
      <p className="mt-6 rounded-2xl border border-dashed border-border-subtle p-8 text-sm text-muted-foreground">
        Fitur ini sedang direncanakan. Slot reservasi, review, dan pembayaran akan
        transparan dan terkontrol sebelum tayang ke publik.
      </p>
    </div>
  );
}
