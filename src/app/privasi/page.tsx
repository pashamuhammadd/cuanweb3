import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Kebijakan privasi CuanWeb3.",
  alternates: { canonical: "/privasi" },
};

export default function PrivasiPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="font-heading text-2xl font-bold text-offwhite">Kebijakan Privasi</h1>
      <p className="mt-2 text-xs text-muted-foreground">
        Draf awal — akan diperbarui mengikuti implementasi fitur dan
        persetujuan pemilik platform.
      </p>

      <div className="prose-invert mt-6 space-y-4 text-sm leading-relaxed text-offwhite/90">
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Data yang kami kumpulkan</h2>
          <p className="mt-1">
            Saat kamu masuk lewat link email, kami menyimpan alamat email kamu
            untuk membuat akun CuanWeb3. Bila kamu masuk dengan Google, kami
            juga menerima nama profil dan ID akun Google (provider subject).
            Kami juga menyimpan username, skill tags, dan preferensi
            notifikasi yang kamu atur sendiri.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Bagaimana data digunakan</h2>
          <p className="mt-1">
            Data dipakai untuk menampilkan profil, menyimpan peluang
            (bookmark), mencegah duplikasi partisipasi campaign, dan mengirim
            notifikasi yang kamu setujui. Kami tidak menjual data pengguna ke
            pihak ketiga.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Keamanan</h2>
          <p className="mt-1">
            Kami tidak pernah meminta seed phrase atau private key. Secret
            server disimpan di environment variable, akses database diatur
            lewat Row Level Security (RLS) yang menolak akses secara default.
          </p>
        </section>
        <section>
          <h2 className="font-heading font-semibold text-offwhite">Hak pengguna</h2>
          <p className="mt-1">
            Kamu dapat memperbarui profil kapan saja lewat halaman Akun, dan
            dapat meminta penghapusan akun dengan menghubungi kami melalui
            halaman Kontak.
          </p>
        </section>
      </div>
    </div>
  );
}
