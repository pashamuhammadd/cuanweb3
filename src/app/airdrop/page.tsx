import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/category/category-page-content";
import { CATEGORIES } from "@/lib/nav";

const category = CATEGORIES.find((c) => c.slug === "airdrop")!;

export const metadata: Metadata = {
  title: category.label,
  description: category.description,
  alternates: { canonical: "/airdrop" },
};

export default function AirdropPage() {
  return <CategoryPageContent category={category} />;
}
