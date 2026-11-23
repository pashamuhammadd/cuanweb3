import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/category/category-page-content";
import { CATEGORIES } from "@/lib/nav";

const category = CATEGORIES.find((c) => c.slug === "bounty")!;

export const metadata: Metadata = {
  title: category.label,
  description: category.description,
  alternates: { canonical: "/bounty" },
};

export default function BountyPage() {
  return <CategoryPageContent category={category} />;
}
