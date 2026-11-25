import type { Metadata } from "next";
import { Mail, Facebook } from "lucide-react";

export const metadata: Metadata = {
  title: "Kontak",
  description: "Hubungi tim CuanWeb3.",
  alternates: { canonical: "/kontak" },
};

export default function KontakPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-heading text-2xl font-bold text-offwhite">Kontak</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ada pertanyaan, laporan bug, atau ingin menjadi sponsor campaign?
        Hubungi kami lewat salah satu kanal berikut.
      </p>

      <div className="mt-6 space-y-3">
        <a
          href="mailto:halo@cuanweb3.com"
          className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-4 text-sm text-offwhite transition-colors hover:border-teal"
        >
          <Mail className="h-5 w-5 text-teal" aria-hidden />
          halo@cuanweb3.com
        </a>
        <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-4 text-sm text-offwhite">
          <Facebook className="h-5 w-5 text-teal" aria-hidden />
          Komunitas Cuan Web3 (Facebook Group)
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Email kontak di atas adalah placeholder hingga pemilik mengonfirmasi
        alamat resmi yang akan dipakai untuk domain cuanweb3.com.
      </p>
    </div>
  );
}
