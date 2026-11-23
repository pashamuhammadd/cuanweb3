export default function AkunAktivitasPage() {
  return (
    <div>
      <h1 className="font-heading text-xl font-bold text-offwhite">Aktivitas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Riwayat campaign, misi, dan submission akan muncul di sini.
      </p>
      <p className="mt-6 rounded-2xl border border-dashed border-border-subtle p-8 text-center text-sm text-muted-foreground">
        Belum ada aktivitas. Fitur campaign dan misi berbayar akan tersedia
        pada fase berikutnya (lihat docs/ROADMAP.md).
      </p>
    </div>
  );
}
