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
  },
  {
    icon: ShieldCheck,
    title: "What leaves your device",
    body: "Your document bytes stay in the browser tab that opened the tool. ArsPDF does not send file contents to analytics, logging, or storage services. The application itself is static front-end code hosted on Vercel; Vercel still receives ordinary web requests for pages and assets, as it would for any website.",
  },
  {
    icon: Trash2,
    title: "Clearing your workspace",
    body: "Use the Start over control after a result, the remove buttons on selected files, or close the tab. File handles are held in memory only, never in localStorage or cookies. Temporary download URLs are revoked after use, and PDF.js documents are destroyed when a tool is unmounted.",
  },
  {
    icon: AlertTriangle,
    title: "Browser memory is the real limit",
    body: "To reduce crash risk, ArsPDF accepts files up to 100 MB each and queues up to 250 MB at once. Those are safety guards, not a claim that every file under the limit will succeed. Complex PDFs, many high-resolution images, mobile devices, and low-memory tabs can still fail. There is no unlimited processing.",
  },
  {
    icon: MonitorSmartphone,
    title: "Fidelity and compatibility",
    body: "Pdf-lib preserves page content when merging, splitting, rotating, and inserting text, but unusual fonts, embedded scripts, forms, and exotic PDF features may not survive every operation. Office conversions are best-effort and text-focused; each conversion tool states its limits before you run it. Always review the result before relying on it.",
  },
  {
    icon: Code2,
    title: "Real encryption, labeled conversions",
    body: "Protect PDF applies AES-256 encryption in your browser using the Web Crypto API, and your password never leaves the tab. When a conversion cannot preserve everything, ArsPDF says so instead of pretending the output is a perfect match.",
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
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
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
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          About ArsPDF
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          A PDF toolkit that tells you what it actually does.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          ArsPDF was built by Aryan Sonsurkar, also known as{" "}
          <span className="font-medium text-foreground">ARS</span>, as a portfolio
          project that stays useful without accounts, subscriptions, or inflated
          claims. The design principle is simple: process locally, label fidelity
          limits clearly, and do not pretend a conversion is lossless when it is
          not.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <section.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-sm font-semibold">{section.title}</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-success/25 bg-success/10 text-success">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Tools that run locally in this build</h2>
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
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/35 hover:text-foreground"
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

      <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold tracking-tight">
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
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Browse tools
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-elevated px-4 text-sm font-medium transition-colors hover:bg-[hsl(222_22%_17%)]"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub repository
          </a>
        </div>
      </section>
    </div>
  );
}
