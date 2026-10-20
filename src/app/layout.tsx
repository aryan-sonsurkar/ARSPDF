import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  absoluteUrl,
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
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

export const metadata: Metadata = {
  metadataBase: SITE_URL ? new URL(SITE_URL) : undefined,
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
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
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: canonical,
    siteName: SITE_NAME,
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
      <body className="min-h-screen font-sans">
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
