import { GITHUB_URL } from "@/lib/config";
import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";
import { getAvailableTools } from "@/lib/tools";

type JsonLdNode = Record<string, unknown>;

export function buildSiteStructuredData(): JsonLdNode | null {
  if (!SITE_URL) return null;

  const siteUrl = absoluteUrl("/")!;
  const logoUrl = absoluteUrl("/icon-512.png");
  const organizationId = `${siteUrl}#organization`;
  const websiteId = `${siteUrl}#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: SITE_NAME,
        url: siteUrl,
        logo: logoUrl
          ? {
              "@type": "ImageObject",
              url: logoUrl,
              width: 512,
              height: 512,
            }
          : undefined,
        sameAs: [GITHUB_URL],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Any modern web browser",
        browserRequirements: "Requires JavaScript",
        isAccessibleForFree: true,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: getAvailableTools().map((tool) => tool.title),
        publisher: { "@id": organizationId },
      },
    ],
  };
}

export function buildBreadcrumbStructuredData(
  items: Array<{ name: string; path: string }>,
): JsonLdNode | null {
  if (!SITE_URL) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
