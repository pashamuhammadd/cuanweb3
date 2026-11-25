import type { Metadata } from "next";
import Image from "next/image";
import { Users, MessageCircle, CalendarDays, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = {
  title: "Komunitas",
  description: "Diskusi, agenda, dan cari tim komunitas CuanWeb3.",
  alternates: { canonical: "/komunitas" },
};

const PLANNED = [
  { icon: MessageCircle, title: "Diskusi", desc: "Ruang bertukar info seputar peluang Web3 dan pengalaman mengikuti campaign." },
  { icon: CalendarDays, title: "Agenda", desc: "Jadwal AMA, hackathon, dan acara komunitas akan tampil di sini." },
  { icon: Users, title: "Cari tim", desc: "Temukan rekan satu tim untuk hackathon dan kompetisi Web3." },
];

export default function KomunitasPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-5 md:px-6 md:py-8">
      <section className="relative overflow-hidden rounded-2xl border border-border-subtle bg-[radial-gradient(90%_120%_at_100%_0%,rgba(244,189,53,0.14),transparent_55%),linear-gradient(160deg,#102b2b,#121a22)] p-5 md:p-8">
        <PageHeader
          title="Komunitas CuanWeb3"
          description="Berbasis komunitas Facebook Komunitas Cuan Web3 (±53,1 ribu anggota). Belajar bareng, saling cek info, dan cari tim."
          className="max-w-xl"
        />
        <Image
          src="/assets/cua/avatar.png"
          alt=""
          width={140}
          height={140}
          className="pointer-events-none absolute -right-4 -bottom-6 hidden h-36 w-36 object-contain opacity-90 sm:block"
        />
      </section>

      <h2 className="font-heading mt-8 text-lg font-bold text-offwhite md:text-xl">Segera hadir di CuanWeb3</h2>
      <ul className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
        {PLANNED.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="card-surface p-4 md:p-5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal/15 text-teal">
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <h3 className="font-heading mt-3 font-semibold text-offwhite">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex items-start gap-2 rounded-xl border border-border-faint bg-surface p-4 text-sm text-offwhite/80">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
        Admin komunitas tidak akan pernah meminta seed phrase, private key, atau transfer dana untuk klaim hadiah.
      </p>
    </div>
  );
}
