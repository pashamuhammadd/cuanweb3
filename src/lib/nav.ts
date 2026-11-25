import type { LucideIcon } from "lucide-react";
import type { OpportunityCategory } from "@/types/opportunity";
import {
  Home,
  Compass,
  LineChart,
  BookOpen,
  Users,
  User,
  Coins,
  Gift,
  Trophy,
  BriefcaseBusiness,
  CodeXml,
  HandCoins,
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
  image: string;
  icon: LucideIcon;
};

const base = (slug: OpportunityCategory) => ({ slug, href: CATEGORY_HREFS[slug], label: CATEGORY_LABELS[slug] });

/** Semua kategori (10). Enam pertama tampil di grid beranda sesuai DESIGN.md. */
export const CATEGORIES: Category[] = [
  {
    ...base("airdrop"),
    description: "Klaim token dari proyek Web3 yang membuka distribusi publik.",
    image: "/assets/cua/airdrop.png",
    icon: Coins,
  },
  {
    ...base("giveaway"),
    description: "Giveaway eksternal dan campaign sponsor dengan tugas sederhana.",
    image: "/assets/cua/giveaway.png",
    icon: Gift,
  },
  {
    ...base("bounty"),
    label: "Bounty & Kontes",
    includes: ["bounty", "contest"],
    description: "Meme, desain, video, tulisan hingga bounty developer.",
    image: "/assets/cua/bounty.png",
    icon: Trophy,
  },
  {
    ...base("jobs"),
    description: "Lowongan kerja dan proyek lepas di ekosistem Web3.",
    image: "/assets/cua/jobs.png",
    icon: BriefcaseBusiness,
  },
  {
    ...base("hackathon"),
    description: "Kompetisi membangun produk Web3 bersama tim.",
    image: "/assets/cua/hackathon.png",
    icon: CodeXml,
  },
  {
    ...base("grants"),
    description: "Pendanaan untuk proyek dan riset ekosistem Web3.",
    image: "/assets/cua/grants.png",
    icon: HandCoins,
  },
  {
    ...base("contest"),
    description: "Kontes kreatif dan kompetisi Web3 dengan hadiah untuk pemenang.",
    image: "/assets/cua/bounty.png",
    icon: Medal,
  },
  {
    ...base("testnet"),
    description: "Program testnet: coba jaringan baru sebelum mainnet. Reward tidak dijamin.",
    image: "/assets/cua/airdrop.png",
    icon: FlaskConical,
  },
  {
    ...base("ambassador"),
    description: "Program ambassador, fellowship, dan kontributor komunitas.",
    image: "/assets/cua/welcome.png",
    icon: Megaphone,
  },
  {
    ...base("paid_mission"),
    description: "Misi berbayar eksternal: uji produk, riset, dan tugas terstruktur.",
    image: "/assets/cua/jobs.png",
    icon: ClipboardCheck,
  },
];

export const HOME_CATEGORIES = CATEGORIES.slice(0, 6);

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

export const MOBILE_BOTTOM_NAV: NavItem[] = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/peluang", label: "Peluang", icon: Compass },
  { href: "/market", label: "Market", icon: LineChart },
  { href: "/akun", label: "Akun", icon: User },
];
