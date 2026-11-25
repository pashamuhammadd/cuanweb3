import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function MissionGuideBanners() {
  return (
    <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-4 py-4 md:grid-cols-2 md:px-6">
      <Link
        href="/misi"
        className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-4 transition-colors hover:border-teal/60"
      >
        <div className="relative h-14 w-14 shrink-0">
          <Image src="/assets/cua/grants.png" alt="" fill sizes="56px" className="object-contain" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-offwhite">Misi berbayar</h3>
          <p className="text-sm text-muted-foreground">
            Selesaikan tugas sederhana dan dapatkan reward.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-teal" aria-hidden />
      </Link>

      <Link
        href="/belajar"
        className="group flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-4 transition-colors hover:border-teal/60"
      >
        <div className="relative h-14 w-14 shrink-0">
          <Image src="/assets/cua/welcome.png" alt="" fill sizes="56px" className="object-contain" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-offwhite">Panduan Web3</h3>
          <p className="text-sm text-muted-foreground">
            Belajar Web3 dari dasar hingga praktik.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-teal" aria-hidden />
      </Link>
    </section>
  );
}
