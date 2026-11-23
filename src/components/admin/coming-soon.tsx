export function AdminComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">{title}</h1>
      <p className="mt-6 rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
        Modul ini belum diimplementasikan — direncanakan pada {phase} (lihat
        docs/ROADMAP.md). Tabel data sudah dirancang di docs/ARCHITECTURE.md
        tetapi UI dan alur kerja belum dibangun.
      </p>
    </div>
  );
}
