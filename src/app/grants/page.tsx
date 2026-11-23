import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/category/category-page-content";
import { CATEGORIES } from "@/lib/nav";

const category = CATEGORIES.find((c) => c.slug === "grants")!;

export const metadata: Metadata = {
  title: category.label,
  description: category.description,
  alternates: { canonical: "/grants" },
};

export default function GrantsPage() {
  return <CategoryPageContent category={category} />;
}
