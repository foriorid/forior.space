import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getListings } from "@/lib/store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `https://${site.domain}`;
  const listings = await getListings({ status: "published" });
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/cari`, changeFrequency: "daily", priority: 0.8 },
    ...listings.map((l) => ({
      url: `${base}/listing/${l.id}`,
      lastModified: l.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
