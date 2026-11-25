import Link from "next/link";
import { BookOpen, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";

type Article = { id: string; slug: string; title: string; summary: string };

/** Edukasi praktis: pengingat keamanan + artikel terbaru. */
export function MissionGuideBanners({ articles }: { articles: Article[] }) {
  return (
    <section aria-labelledby="belajar-heading" className="mx-auto max-w-[1440px] px-4 pb-10 md:px-6 lg:px-10">
      <SectionHeading id="belajar-heading" title="Belajar sebelum ikut" href="/belajar" linkLabel="Semua panduan" />

      <div className="mt-4 grid grid-cols-1 gap-3 md:mt-5 md:grid-cols-3 md:gap-5">
        <div className="card-surface p-5 md:row-span-2">
          <ShieldCheck className="h-6 w-6 text-gold" aria-hidden />
          <h3 className="font-heading mt-3 text-lg font-bold text-offwhite">Aman dulu, baru cuan</h3>
          <ul className="mt-3 space-y-2 text-sm text-offwhite/80">
            <li>Jangan pernah bagikan seed phrase atau private key.</li>
            <li>Ikuti peluang hanya lewat link resmi penyelenggara.</li>
            <li>Gunakan wallet terpisah untuk airdrop dan testnet.</li>
          </ul>
        </div>

        {articles.slice(0, 4).map((a) => (
          <Link key={a.id} href={`/belajar/${a.slug}`} className="card-surface card-interactive press group flex items-start gap-3 p-4">
            <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
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
