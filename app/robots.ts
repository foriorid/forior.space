import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = `https://${site.domain}`;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/masuk"] },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
