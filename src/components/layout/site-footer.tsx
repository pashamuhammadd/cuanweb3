import Link from "next/link";
import { Logo } from "./logo";

const FOOTER_LINKS = [
  {
    title: "Peluang",
    links: [
      { href: "/airdrop", label: "Airdrop" },
      { href: "/giveaway", label: "Giveaway" },
      { href: "/bounty", label: "Bounty & Kontes" },
      { href: "/jobs", label: "Web3 Jobs" },
      { href: "/hackathon", label: "Hackathon" },
      { href: "/grants", label: "Grants" },
      { href: "/kategori", label: "Semua kategori" },
    ],
  },
  {
    title: "Komunitas",
    links: [
      { href: "/belajar", label: "Belajar" },
      { href: "/komunitas", label: "Komunitas" },
      { href: "/misi", label: "Misi berbayar" },
      { href: "/plus", label: "CuanWeb3 Plus" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { href: "/tentang", label: "Tentang" },
      { href: "/kontak", label: "Kontak" },
      { href: "/privasi", label: "Kebijakan Privasi" },
      { href: "/ketentuan", label: "Ketentuan Layanan" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border-faint bg-section">
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-6 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_repeat(3,1fr)] md:gap-10">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Temukan peluang. Raih cuan. Platform peluang penghasilan Web3
              untuk komunitas Indonesia.
            </p>
          </div>
          {FOOTER_LINKS.map((group, i) => (
            <div key={group.title} className={i === 0 ? "hidden md:block" : undefined}>
              <h3 className="font-heading text-sm font-semibold text-offwhite">
                {group.title}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-x-4 md:mt-3 md:block md:space-y-1">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="inline-flex min-h-10 items-center text-sm text-muted-foreground transition-colors hover:text-teal md:min-h-8"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border-subtle pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} CuanWeb3. Peluang eksternal mengikuti
          aturan penyelenggara masing-masing. Selalu cek ulang di situs resmi.
          CuanWeb3 tidak pernah meminta seed phrase atau private key.
        </div>
      </div>
    </footer>
  );
}
