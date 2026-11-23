import type { Metadata } from "next";
import Image from "next/image";
import { Users, MessageCircle, CalendarDays } from "lucide-react";

export const metadata: Metadata = {
  title: "Komunitas",
  description: "Diskusi, agenda, dan cari tim komunitas CuanWeb3.",
  alternates: { canonical: "/komunitas" },
};

export default function KomunitasPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 md:px-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <Image src="/assets/cua/avatar.png" alt="" fill sizes="64px" className="object-contain" />
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-offwhite">Komunitas CuanWeb3</h1>
          <p className="text-sm text-muted-foreground">
            Berbasis komunitas Facebook Komunitas Cuan Web3 (±53.1 ribu anggota).
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <InfoCard
          icon={MessageCircle}
          title="Diskusi"
          desc="Ruang bertukar info seputar peluang Web3 dan pengalaman mengikuti campaign."
        />
        <InfoCard
          icon={CalendarDays}
          title="Agenda"
          desc="Jadwal AMA, hackathon, dan acara komunitas akan tampil di sini."
        />
        <InfoCard
          icon={Users}
          title="Cari tim"
          desc="Temukan rekan satu tim untuk hackathon dan kompetisi Web3."
        />
      </div>

      <p className="mt-8 rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
        Fitur diskusi dan moderasi penuh direncanakan pada Fase 3 — Misi dan
        komunitas (lihat docs/ROADMAP.md).
      </p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Users;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-5">
      <Icon className="h-5 w-5 text-teal" aria-hidden />
      <h2 className="font-heading mt-3 font-semibold text-offwhite">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
