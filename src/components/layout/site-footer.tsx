import Link from "next/link";
import { GitHubIcon } from "@/components/ui/github-icon";
import { Logo } from "@/components/ui/logo";
import { GITHUB_URL } from "@/lib/config";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-surface/40">
      <div className="mx-auto w-full max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              Every PDF tool. No paywalls. A browser-first toolkit built so common
              document work stays on your device whenever the tool allows it.
            </p>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitHubIcon className="h-4 w-4" />
              View the source
            </a>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Product
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#tools" className="text-muted-foreground hover:text-foreground">
                  All tools
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-muted-foreground hover:text-foreground">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About &amp; privacy
                </Link>
              </li>
              <li>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-muted-foreground hover:text-foreground"
                >
                  GitHub repository
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Popular tools
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tools/merge-pdf" className="text-muted-foreground hover:text-foreground">
                  Merge PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/split-pdf" className="text-muted-foreground hover:text-foreground">
                  Split PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/organize-pdf" className="text-muted-foreground hover:text-foreground">
                  Organize PDF
                </Link>
              </li>
              <li>
                <Link href="/tools/image-to-pdf" className="text-muted-foreground hover:text-foreground">
                  Image to PDF
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border/70 pt-6 text-xs leading-relaxed text-muted-foreground sm:flex-row sm:items-start sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} ArsPDF. Built by Aryan Sonsurkar.
            Released under the MIT License.
          </p>
          <p className="max-w-xl sm:text-right">
            Capabilities depend on the tool and the document. Files are processed
            in your browser for every tool in this build. Browser memory, file
            complexity, and device performance still apply.
          </p>
        </div>
      </div>
    </footer>
  );
}
