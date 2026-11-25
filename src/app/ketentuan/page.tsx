import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ketentuan Layanan",
  description: "Ketentuan layanan CuanWeb3.",
  alternates: { canonical: "/ketentuan" },
};

export default function KetentuanPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-heading text-2xl font-bold text-offwhite">Ketentuan Layanan</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Draf awal. Akan diperbarui mengikuti implementasi fitur dan
        persetujuan pemilik platform.
      </p>

      <div className="prose-invert mt-6 space-y-4 text-sm leading-relaxed text-offwhite/90">
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Sifat layanan</h2>
          <p className="mt-1">
            CuanWeb3 adalah agregator informasi peluang Web3. Kami tidak
            menyelenggarakan airdrop, hackathon, atau grants pihak ketiga;
            pendaftaran dan syarat mengikuti aturan penyelenggara asli.
            Login lewat email atau Google tidak membuktikan satu orang hanya
            memiliki satu akun.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Data contoh</h2>
          <p className="mt-1">
            Selama pengembangan, sebagian listing berlabel &quot;Contoh&quot;
            adalah data simulasi untuk keperluan desain dan pengujian, bukan
            peluang nyata.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Campaign sponsor & hadiah</h2>
          <p className="mt-1">
            Giveaway dan misi berbayar yang dikelola langsung oleh CuanWeb3
            hanya aktif setelah dana hadiah tersedia dan disetujui pemilik.
            Hasil undian bersifat final berdasarkan proses acak yang tercatat
            dan diaudit.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Batasan tanggung jawab</h2>
          <p className="mt-1">
            Kami tidak bertanggung jawab atas kerugian akibat interaksi kamu
            dengan pihak ketiga (proyek, sponsor, atau penyelenggara eksternal)
            yang ditautkan dari platform ini. Selalu lakukan riset mandiri
            sebelum berpartisipasi.
          </p>
        </section>
      </div>
    </div>
  );
}
