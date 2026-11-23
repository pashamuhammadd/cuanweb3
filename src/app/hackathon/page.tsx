import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/category/category-page-content";
import { CATEGORIES } from "@/lib/nav";

const category = CATEGORIES.find((c) => c.slug === "hackathon")!;

export const metadata: Metadata = {
  title: category.label,
  description: category.description,
  alternates: { canonical: "/hackathon" },
};

export default function HackathonPage() {
  return <CategoryPageContent category={category} />;
}
