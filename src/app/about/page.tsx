import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Code2,
  HardDrive,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { GitHubIcon } from "@/components/ui/github-icon";
import { GITHUB_URL } from "@/lib/config";
import { createPageMetadata } from "@/lib/site";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";
import { getAvailableTools } from "@/lib/tools";

export const metadata: Metadata = createPageMetadata({
  title: "About & privacy",
  description:
    "How ArsPDF processes documents, what stays in your browser, and the real limits of browser-based PDF work.",
  path: "/about",
  keywords: [
    "ArsPDF privacy",
    "browser PDF tools",
    "local PDF processing",
    "private PDF editor",
  ],
});

const SECTIONS = [
  {
    icon: HardDrive,
    title: "Local processing model",
    body: "Every tool in this build uses client-side JavaScript. PDF-lib edits and encrypts documents, PDF.js renders pages and reads text, and office conversions run through local parsers and a canvas renderer. There are no API routes that accept document uploads, no external conversion service, no database, and no AI processing.",
    accent: "text-chalk-green",
    bar: "bg-chalk-green",
  },
  {
    icon: ShieldCheck,
    title: "What leaves your device",
    body: "Your document bytes stay in the browser tab that opened the tool. ArsPDF does not send file contents to analytics, logging, or storage services. The application itself is static front-end code hosted on Vercel; Vercel still receives ordinary web requests for pages and assets, as it would for any website.",
    accent: "text-chalk-blue",
    bar: "bg-chalk-blue",
  },
  {
    icon: Trash2,
    title: "Clearing your workspace",
    body: "Use the Start over control after a result, the remove buttons on selected files, or close the tab. File handles are held in memory only, never in localStorage or cookies. Temporary download URLs are revoked after use, and PDF.js documents are destroyed when a tool is unmounted.",
    accent: "text-chalk-pink",
    bar: "bg-chalk-pink",
  },
  {
    icon: AlertTriangle,
    title: "Browser memory is the real limit",
    body: "To reduce crash risk, ArsPDF accepts files up to 100 MB each and queues up to 250 MB at once. Those are safety guards, not a claim that every file under the limit will succeed. Complex PDFs, many high-resolution images, mobile devices, and low-memory tabs can still fail. There is no unlimited processing.",
    accent: "text-chalk-yellow",
    bar: "bg-chalk-yellow",
  },
  {
    icon: MonitorSmartphone,
    title: "Fidelity and compatibility",
    body: "Pdf-lib preserves page content when merging, splitting, rotating, and inserting text, but unusual fonts, embedded scripts, forms, and exotic PDF features may not survive every operation. Office conversions are best-effort and text-focused; each conversion tool states its limits before you run it. Always review the result before relying on it.",
    accent: "text-chalk-purple",
    bar: "bg-chalk-purple",
  },
  {
    icon: Code2,
    title: "Real encryption, labeled conversions",
    body: "Protect PDF applies AES-256 encryption in your browser using the Web Crypto API, and your password never leaves the tab. When a conversion cannot preserve everything, ArsPDF says so instead of pretending the output is a perfect match.",
    accent: "text-chalk-orange",
    bar: "bg-chalk-orange",
  },
];

const breadcrumbData = buildBreadcrumbStructuredData([
  { name: "Home", path: "/" },
  { name: "About & privacy", path: "/about" },
]);

export default function AboutPage() {
  const available = getAvailableTools();

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      {breadcrumbData ? <JsonLd data={breadcrumbData} /> : null}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1.5 font-display text-sm tracking-wide text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-chalk-yellow">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            About &amp; privacy
          </li>
        </ol>
      </nav>

      <div className="max-w-2xl">
        <p className="font-marker text-xs uppercase tracking-[0.22em] text-chalk-pink">
          About ArsPDF
        </p>
        <h1 className="mt-3 font-marker text-3xl leading-tight tracking-tight chalk-heading sm:text-4xl">
          A PDF toolkit that tells you what it{" "}
          <span className="doodle-underline text-chalk-yellow">actually does.</span>
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          ArsPDF was built by Aryan Sonsurkar, also known as{" "}
          <span className="font-bold text-foreground">ARS</span>, as a portfolio
          project that stays useful without accounts, subscriptions, or inflated
          claims. The design principle is simple: process locally, label fidelity
          limits clearly, and do not pretend a conversion is lossless when it is
          not.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {SECTIONS.map((section, index) => (
          <section
            key={section.title}
            className={`slate relative overflow-hidden rounded-2xl border-2 border-foreground/15 p-5 ${
              index % 2 === 0 ? "rotate-[-0.4deg]" : "rotate-[0.4deg]"
            }`}
          >
            <span className={`absolute inset-y-0 left-0 w-1.5 ${section.bar} opacity-70`} aria-hidden="true" />
            <span
              className={`grid h-11 w-11 place-items-center rounded-[14px_10px_16px_12px] border-2 border-dashed border-current bg-background/40 ${section.accent}`}
            >
              <section.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-lg leading-tight tracking-wide">
              {section.title}
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border-2 border-dashed border-chalk-green/40 bg-chalk-green/[0.06] p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-[14px_10px_16px_12px] border-2 border-dashed border-chalk-green/50 bg-chalk-green/10 text-chalk-green">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-display text-lg tracking-wide">
              Tools that run locally in this build
            </h2>
            <p className="text-xs text-muted-foreground">
              {available.length} working tools. Each one manipulates the document in
              your browser.
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {available.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-foreground/25 bg-background/40 px-3 py-1.5 font-display text-sm tracking-wide text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-chalk-yellow/60 hover:text-foreground"
              >
                {tool.title}
              </Link>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          All {available.length} tools produce a real output file. Office and
          text-extraction tools are intentionally text-focused: they state their
          fidelity limits on the tool page and never present a limited conversion
          as a perfect round trip.
        </p>
      </section>

      <section className="slate relative mt-10 overflow-hidden rounded-2xl border-2 border-foreground/15 p-6 sm:p-8">
        <span className="tape absolute -top-3 left-10 h-5 w-24 -rotate-3" aria-hidden="true" />
        <h2 className="font-marker text-xl tracking-tight chalk-heading">
          Open source, with an honest roadmap
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The project is released under the MIT License and maintained by Aryan
          Sonsurkar (ARS). Every tool now produces a real output file in the
          browser; future work focuses on improving conversion fidelity where a
          browser-compatible implementation can be trusted.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/#tools"
            className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-chalk-yellow bg-chalk-yellow px-4 font-display text-base tracking-wide text-primary-foreground shadow-[0_4px_0_-1px_hsl(44_98%_42%)] transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
          >
            Browse tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-dashed border-foreground/30 bg-surface/60 px-4 font-display text-base tracking-wide transition-all hover:-translate-y-0.5 hover:border-chalk-blue/70"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub repository
          </a>
        </div>
      </section>
    </div>
  );
}
