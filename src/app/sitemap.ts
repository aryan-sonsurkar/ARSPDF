import type { MetadataRoute } from "next";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!SITE_URL) return [];

  return [
    {
      url: absoluteUrl("/")!,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: absoluteUrl("/about")!,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...TOOLS.map((tool) => ({
      url: absoluteUrl(`/tools/${tool.slug}`)!,
      changeFrequency: "monthly" as const,
      priority: tool.status === "available" ? 0.8 : 0.4,
    })),
  ];
}
