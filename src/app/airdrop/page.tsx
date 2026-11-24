import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/category/category-page-content";
import { CATEGORIES } from "@/lib/nav";

// ISR: listing diperbarui otomatis tiap 5 menit (hasil cron Opportunity Engine).
export const revalidate = 300;

const category = CATEGORIES.find((c) => c.slug === "airdrop")!;

export const metadata: Metadata = {
  title: category.label,
  description: category.description,
  alternates: { canonical: "/airdrop" },
};

export default function AirdropPage() {
  return <CategoryPageContent category={category} />;
}
