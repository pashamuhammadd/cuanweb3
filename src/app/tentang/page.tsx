import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Tentang CuanWeb3 dan misi platform.",
  alternates: { canonical: "/tentang" },
};

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-heading text-2xl font-bold text-offwhite">Tentang CuanWeb3</h1>
      <div className="prose-invert mt-4 space-y-4 text-sm leading-relaxed text-offwhite/90">
        <p>
          CuanWeb3 membantu masyarakat Indonesia menemukan peluang penghasilan
          Web3 — airdrop, giveaway, bounty & kontes, pekerjaan, hackathon, dan
          grants — dalam satu tempat. Platform ini berangkat dari komunitas
          Facebook Komunitas Cuan Web3 dengan sekitar 53,1 ribu anggota.
        </p>
        <p>
          Kami memfokuskan 70% konten pada peluang cuan dan 30% pada edukasi
          praktis, termasuk dasar keamanan wallet, agar pengguna dapat
          berpartisipasi dengan lebih aman dan paham risiko.
        </p>
        <p>
          CuanWeb3 menampilkan peluang publik dan kampanye sponsor/komunitas.
          Layanan dan pesanan aset kreatif custom dikelola secara terpisah oleh
          Nimia Studio dan tidak menjadi bagian dari platform ini.
        </p>
        <p>
          Status platform: dalam pengembangan aktif. Beberapa fitur (campaign
          sponsor, misi berbayar, CuanWeb3 Plus) masih dalam tahap
          perencanaan atau pengembangan — lihat roadmap publik untuk detail.
        </p>
      </div>
    </div>
  );
}
