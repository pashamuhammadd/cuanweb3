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
} from "lucide-react";

export type Category = {
  slug: OpportunityCategory;
  label: string;
  description: string;
  image: string;
  icon: LucideIcon;
};

export const CATEGORIES: Category[] = [
  {
    slug: "airdrop",
    label: "Airdrop",
    description: "Klaim token dari proyek Web3 yang membuka distribusi publik.",
    image: "/assets/cua/airdrop.png",
    icon: Rocket,
  },
  {
    slug: "giveaway",
    label: "Giveaway",
    description: "Ikuti tugas sederhana dan menangkan hadiah dari campaign sponsor.",
    image: "/assets/cua/giveaway.png",
    icon: Gift,
  },
  {
    slug: "bounty",
    label: "Bounty & Kontes",
    description: "Meme, desain, video, tulisan hingga bounty developer.",
    image: "/assets/cua/bounty.png",
    icon: Trophy,
  },
  {
    slug: "jobs",
    label: "Web3 Jobs",
    description: "Lowongan kerja dan proyek lepas di ekosistem Web3.",
    image: "/assets/cua/jobs.png",
    icon: Briefcase,
  },
  {
    slug: "hackathon",
    label: "Hackathon",
    description: "Kompetisi membangun produk Web3 bersama tim.",
    image: "/assets/cua/hackathon.png",
    icon: Code2,
  },
  {
    slug: "grants",
    label: "Grants",
    description: "Pendanaan untuk proyek dan riset ekosistem Web3.",
    image: "/assets/cua/grants.png",
    icon: Landmark,
  },
];

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
