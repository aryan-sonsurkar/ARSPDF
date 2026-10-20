import type { Metadata } from "next";

export const SITE_NAME = "ArsPDF";
export const SITE_TITLE = "ArsPDF — Every PDF tool. No paywalls.";
export const SITE_DESCRIPTION =
  "A free, browser-based PDF toolkit. Merge, split, organize, rotate, watermark, and convert images to PDF without an account or artificial quotas.";
export const OG_IMAGE = {
  path: "/og.png",
  width: 1200,
  height: 630,
  alt: "ArsPDF — Every PDF tool. No paywalls.",
};

function resolveSiteUrl(value: string | undefined) {
  const candidate = value?.trim();
  if (!candidate) return null;

  const withProtocol = /^https?:\/\//i.test(candidate)
    ? candidate
    : `https://${candidate}`;

  try {
    const url = new URL(withProtocol);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export const SITE_URL = resolveSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
);

export function absoluteUrl(path = "/") {
  if (!SITE_URL) return undefined;
  return new URL(path, `${SITE_URL}/`).toString();
}

export function createPageMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const canonical = absoluteUrl(path);
  const image = absoluteUrl(OG_IMAGE.path);
  const socialTitle = `${title} · ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      images: image
        ? [
            {
              url: image,
              width: OG_IMAGE.width,
              height: OG_IMAGE.height,
              alt: OG_IMAGE.alt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}
