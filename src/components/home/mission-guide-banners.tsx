import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";

type Article = { id: string; slug: string; title: string; summary: string };

/** Edukasi praktis: artikel terbaru + pengingat keamanan. */
export function MissionGuideBanners({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="belajar-heading" className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-10">
      <div className="flex items-center justify-between gap-3">
        <h2 id="belajar-heading" className="font-heading text-lg font-bold text-offwhite md:text-xl">
          Belajar sebelum ikut
        </h2>
        <Link
          href="/belajar"
          className="inline-flex min-h-10 items-center gap-1 rounded-lg px-1 text-sm font-medium text-gold underline-offset-4 hover:underline"
        >
          Semua panduan
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-[linear-gradient(150deg,#102b2b,#121a22)] p-5 md:row-span-2">
          <ShieldCheck className="h-6 w-6 text-teal" aria-hidden />
          <h3 className="font-heading mt-3 text-lg font-bold text-offwhite">Aman dulu, baru cuan</h3>
          <ul className="mt-3 space-y-2 text-sm text-offwhite/80">
            <li>Jangan pernah bagikan seed phrase atau private key.</li>
            <li>Ikuti peluang hanya lewat link resmi penyelenggara.</li>
            <li>Gunakan wallet terpisah untuk airdrop dan testnet.</li>
          </ul>
          <Image
            src="/assets/cua/welcome.png"
            alt=""
            width={120}
            height={120}
            className="pointer-events-none absolute -right-3 -bottom-3 hidden h-28 w-28 object-contain opacity-90 md:block"
          />
        </div>

        {articles.slice(0, 4).map((a) => (
          <Link
            key={a.id}
            href={`/belajar/${a.slug}`}
            className="card-surface card-interactive press group flex items-start gap-3 p-4"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal/15 text-teal">
              <BookOpen className="h-4.5 w-4.5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold text-offwhite group-hover:text-gold">{a.title}</span>
              <span className="mt-0.5 line-clamp-2 block text-sm text-muted-foreground">{a.summary}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
