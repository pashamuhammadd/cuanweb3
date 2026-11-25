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
        className="press mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-charcoal"
      >
        Kembali ke Beranda
      </Link>
      <Link href="/peluang" className="mt-3 inline-flex min-h-10 items-center text-sm font-medium text-gold underline-offset-4 hover:underline">
        Jelajahi semua peluang
      </Link>
    </div>
  );
}
