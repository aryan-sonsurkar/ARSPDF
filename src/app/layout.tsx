import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { GITHUB_URL } from "@/lib/config";
import {
  absoluteUrl,
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import { buildSiteStructuredData } from "@/lib/structured-data";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const canonical = absoluteUrl("/");
const socialImage = absoluteUrl(OG_IMAGE.path);
const structuredData = buildSiteStructuredData();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
  themeColor: "#080b14",
};

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Aryan Sonsurkar", url: GITHUB_URL }],
  creator: "Aryan Sonsurkar",
  publisher: SITE_NAME,
  category: "productivity",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  keywords: [
    "PDF tools",
    "merge PDF",
    "split PDF",
    "organize PDF",
    "rotate PDF",
    "image to PDF",
    "free PDF toolkit",
  ],
  alternates: canonical ? { canonical } : undefined,
  verification: {
    google: "tPkn0J9gDX8IFeN6vquQxg8SDzaG5Z4r0Z-Q0j5MHJ8",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: canonical,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: socialImage
      ? [
          {
            url: socialImage,
            width: OG_IMAGE.width,
            height: OG_IMAGE.height,
            alt: OG_IMAGE.alt,
          },
        ]
      : undefined,
  },
  twitter: {
    card: socialImage ? "summary_large_image" : "summary",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: socialImage ? [socialImage] : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body className="min-h-dvh overflow-x-clip font-sans">
        {structuredData ? <JsonLd data={structuredData} /> : null}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
