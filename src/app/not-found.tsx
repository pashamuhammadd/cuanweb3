import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center md:px-6">
      <div className="relative h-32 w-32">
        <Image src="/assets/cua/avatar.png" alt="" fill sizes="128px" className="object-contain" />
      </div>
      <h1 className="font-heading mt-4 text-2xl font-bold text-offwhite">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        CUA sudah mencari ke mana-mana, tapi halaman ini sepertinya belum ada
        atau sudah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-charcoal transition-transform hover:scale-[1.02] active:scale-95"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
