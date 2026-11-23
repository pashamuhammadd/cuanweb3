import type { MetadataRoute } from "next";
import { listOpportunities } from "@/lib/data/opportunities";
import { listPublishedArticles } from "@/lib/data/articles";

const STATIC_ROUTES = [
  "",
  "/peluang",
  "/airdrop",
  "/giveaway",
  "/bounty",
  "/jobs",
  "/hackathon",
  "/grants",
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

  const [{ items: opportunities }, { items: articles }] = await Promise.all([
    listOpportunities(),
    listPublishedArticles(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const opportunityEntries: MetadataRoute.Sitemap = opportunities.map((o) => ({
    url: `${siteUrl}/peluang/${o.slug}`,
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
