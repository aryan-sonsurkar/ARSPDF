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
import { GitHubIcon } from "@/components/ui/github-icon";
import { GITHUB_URL } from "@/lib/config";
import { PROTECT_PDF_LIMITATION } from "@/lib/pdf/protect";
import { getAvailableTools } from "@/lib/tools";

export const metadata: Metadata = {
  title: "About & privacy",
  description:
    "How ArsPDF processes documents, what stays in your browser, and the real limits of browser-based PDF work.",
};

const SECTIONS = [
  {
    icon: HardDrive,
    title: "Local processing model",
    body: "Every working tool in this build uses client-side JavaScript. PDF-lib writes and modifies the documents, and PDF.js renders page thumbnails for Organize PDF. There are no API routes that accept document uploads, no external conversion service, no database, and no AI processing.",
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
    body: "Pdf-lib preserves page content when merging, splitting, rotating, and inserting text, but unusual fonts, embedded scripts, forms, and exotic PDF features may not survive every operation. Password-protected PDFs cannot be opened. Always review the result before relying on it.",
  },
  {
    icon: Code2,
    title: "No fake security or conversions",
    body: PROTECT_PDF_LIMITATION,
  },
];

export default function AboutPage() {
  const available = getAvailableTools();

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
          ArsPDF is a portfolio project built to be useful without accounts,
          subscriptions, or inflated claims. The design principle is simple:
          process locally where possible, label what is not ready, and do not
          pretend a feature exists when it does not.
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
          Not listed as available: password protection, compression, office
          conversions, PDF-to-image, cropping, repair, and PDF-to-text. Their tool
          pages explain the specific limitation.
        </p>
      </section>

      <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/[0.06] p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold tracking-tight">
          Open source, with an honest roadmap
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          The project is released under the MIT License. Planned work includes more
          local tools and better previews, but only where a browser-compatible
          implementation is reliable. No feature is marked available until it produces
          a real output file.
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
