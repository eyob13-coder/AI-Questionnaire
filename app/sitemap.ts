import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "weekly", priority: 1 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/blog", changeFrequency: "monthly", priority: 0.6 },
    { path: "/careers", changeFrequency: "monthly", priority: 0.6 },
    { path: "/changelog", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
    { path: "/docs/api", changeFrequency: "monthly", priority: 0.6 },
    { path: "/dpa", changeFrequency: "monthly", priority: 0.6 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.6 },
    { path: "/security", changeFrequency: "monthly", priority: 0.6 },
    { path: "/status", changeFrequency: "monthly", priority: 0.6 },
    { path: "/terms", changeFrequency: "monthly", priority: 0.6 },
  ];

  return [
    ...pages.map((page) => ({
      url: `${SITE_URL}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  ];
}
