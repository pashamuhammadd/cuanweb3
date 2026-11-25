import type { LucideIcon } from "lucide-react";
import type { OpportunityCategory } from "@/types/opportunity";
import {
  Home,
  Compass,
  LineChart,
  BookOpen,
  Users,
  User,
  Rocket,
  Gift,
  Trophy,
  Briefcase,
  Code2,
  Landmark,
  Medal,
  FlaskConical,
  Megaphone,
  ClipboardCheck,
} from "lucide-react";
import { CATEGORY_HREFS, CATEGORY_LABELS } from "@/lib/categories";

export type Category = {
  slug: OpportunityCategory;
  href: string;
  label: string;
  /** Kategori yang ikut ditampilkan di halaman ini (mis. Bounty & Kontes). */
  includes?: OpportunityCategory[];
  description: string;
  /** Label ringkas untuk grid (mis. "Bounty", "Kontes"). */
  shortLabel: string;
  /** Deskripsi 1 baris untuk kartu kategori desktop. */
  tagline: string;
  image: string;
  icon: LucideIcon;
};

const base = (slug: OpportunityCategory) => ({ slug, href: CATEGORY_HREFS[slug], label: CATEGORY_LABELS[slug] });

/** Semua kategori (10). Grid beranda memakai HOME_CATEGORIES (versi C). */
export const CATEGORIES: Category[] = [
  {
    ...base("airdrop"),
    shortLabel: "Airdrop",
    tagline: "Klaim token dari proyek Web3",
    description: "Klaim token dari proyek Web3 yang membuka distribusi publik.",
    image: "/assets/cua/airdrop.png",
    icon: Rocket,
  },
  {
    ...base("giveaway"),
    shortLabel: "Giveaway",
    tagline: "Hadiah dari campaign resmi",
    description: "Giveaway eksternal dan campaign sponsor dengan tugas sederhana.",
    image: "/assets/cua/giveaway.png",
    icon: Gift,
  },
  {
    ...base("bounty"),
    shortLabel: "Bounty",
    tagline: "Selesaikan tugas, dapatkan hadiah",
    label: "Bounty & Kontes",
    includes: ["bounty", "contest"],
    description: "Meme, desain, video, tulisan hingga bounty developer.",
    image: "/assets/cua/bounty.png",
    icon: Trophy,
  },
  {
    ...base("jobs"),
    shortLabel: "Web3 Jobs",
    tagline: "Lowongan kerja di industri Web3",
    description: "Lowongan kerja dan proyek lepas di ekosistem Web3.",
    image: "/assets/cua/jobs.png",
    icon: Briefcase,
  },
  {
    ...base("hackathon"),
    shortLabel: "Hackathon",
    tagline: "Bangun produk dan raih hadiah",
    description: "Kompetisi membangun produk Web3 bersama tim.",
    image: "/assets/cua/hackathon.png",
    icon: Code2,
  },
  {
    ...base("grants"),
    shortLabel: "Grants",
    tagline: "Pendanaan untuk proyek Web3",
    description: "Pendanaan untuk proyek dan riset ekosistem Web3.",
    image: "/assets/cua/grants.png",
    icon: Landmark,
  },
  {
    ...base("contest"),
    shortLabel: "Kontes",
    tagline: "Kompetisi kreatif berhadiah",
    description: "Kontes kreatif dan kompetisi Web3 dengan hadiah untuk pemenang.",
    image: "/assets/cua/bounty.png",
    icon: Medal,
  },
  {
    ...base("testnet"),
    shortLabel: "Testnet",
    tagline: "Coba jaringan sebelum mainnet",
    description: "Program testnet: coba jaringan baru sebelum mainnet. Reward tidak dijamin.",
    image: "/assets/cua/airdrop.png",
    icon: FlaskConical,
  },
  {
    ...base("ambassador"),
    shortLabel: "Ambassador",
    tagline: "Wakili proyek di komunitas",
    description: "Program ambassador, fellowship, dan kontributor komunitas.",
    image: "/assets/cua/welcome.png",
    icon: Megaphone,
  },
  {
    ...base("paid_mission"),
    shortLabel: "Misi Berbayar",
    tagline: "Tugas terstruktur berbayar",
    description: "Misi berbayar eksternal: uji produk, riset, dan tugas terstruktur.",
    image: "/assets/cua/jobs.png",
    icon: ClipboardCheck,
  },
];

/** Grid beranda versi C: Airdrop, Giveaway, Bounty, Kontes, Web3 Jobs, Hackathon. */
export const HOME_CATEGORIES = (["airdrop", "giveaway", "bounty", "contest", "jobs", "hackathon"] as const).map(
  (slug) => CATEGORIES.find((c) => c.slug === slug)!,
);

export function getCategory(slug: OpportunityCategory): Category {
  return CATEGORIES.find((c) => c.slug === slug)!;
}

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/peluang", label: "Peluang", icon: Compass },
  { href: "/market", label: "Market", icon: LineChart },
  { href: "/belajar", label: "Belajar", icon: BookOpen },
  { href: "/komunitas", label: "Komunitas", icon: Users },
];

const CATEGORY_PATHS = CATEGORIES.map((c) => c.href).concat("/kategori");

/** Halaman kategori dianggap bagian dari "Peluang"; /login bagian dari "Akun". */
export function isNavActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/peluang" && CATEGORY_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return true;
  if (href === "/akun" && pathname.startsWith("/login")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const MOBILE_BOTTOM_NAV: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/peluang", label: "Peluang", icon: Compass },
  { href: "/market", label: "Market", icon: LineChart },
  { href: "/akun", label: "Akun", icon: User },
];
