import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/category/category-page-content";
import { CATEGORIES } from "@/lib/nav";

// ISR: listing diperbarui otomatis tiap 5 menit (hasil cron Opportunity Engine).
export const revalidate = 300;

const category = CATEGORIES.find((c) => c.slug === "giveaway")!;

export const metadata: Metadata = {
  title: category.label,
  description: category.description,
  alternates: { canonical: "/giveaway" },
};

export default function GiveawayPage() {
  return <CategoryPageContent category={category} />;
}
