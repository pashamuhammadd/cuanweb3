import type { MetadataRoute } from "next";
import { listIndexableOpportunities } from "@/lib/data/opportunities";
import { CATEGORIES } from "@/lib/nav";
import { listPublishedArticles } from "@/lib/data/articles";

export const revalidate = 3600;

const STATIC_ROUTES = [
  "",
  "/peluang",
  ...CATEGORIES.map((c) => c.href),
  "/misi",
  "/market",
  "/belajar",
  "/komunitas",
  "/plus",
  "/tentang",
  "/kontak",
  "/privasi",
  "/ketentuan",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const [opportunities, { items: articles }] = await Promise.all([
    listIndexableOpportunities(),
    listPublishedArticles(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const opportunityEntries: MetadataRoute.Sitemap = opportunities.map((o) => ({
    url: `${siteUrl}/peluang/${o.slug}`,
    ...(o.updatedAt ? { lastModified: o.updatedAt } : {}),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/belajar/${a.slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...opportunityEntries, ...articleEntries];
}
