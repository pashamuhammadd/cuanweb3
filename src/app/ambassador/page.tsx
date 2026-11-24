import type { Metadata } from "next";
import { CategoryPageContent } from "@/components/category/category-page-content";
import { getCategory } from "@/lib/nav";

// ISR: listing diperbarui otomatis tiap 5 menit (hasil cron Opportunity Engine).
export const revalidate = 300;

const category = getCategory("ambassador");

export const metadata: Metadata = {
  title: category.label,
  description: category.description,
  alternates: { canonical: category.href },
};

export default function AmbassadorPage() {
  return <CategoryPageContent category={category} />;
}
