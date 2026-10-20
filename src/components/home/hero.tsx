import {
  Files,
  ImagePlus,
  LayoutGrid,
  LockKeyhole,
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { GitHubIcon } from "@/components/ui/github-icon";
import { GITHUB_URL } from "@/lib/config";

const PREVIEW_TOOLS = [
  { label: "Merge PDF", icon: Files },
  { label: "Split PDF", icon: Scissors },
  { label: "Organize PDF", icon: LayoutGrid },
  { label: "Image to PDF", icon: ImagePlus },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 grid-backdrop opacity-[0.28]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-40 top-0 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-[hsl(258_90%_78%)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Free PDF toolkit · Built for the browser
          </div>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Every PDF tool.
            <br />
            <span className="text-primary">No paywalls.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Merge, split, organize, rotate, watermark, and build PDFs from images
            without an account or an artificial daily limit. Files stay on your
            device for every tool in this build.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#tools" size="lg">
              Explore the tools
            </ButtonLink>
            <ButtonLink href={GITHUB_URL} variant="secondary" size="lg" external>
              <GitHubIcon className="h-4 w-4" />
              View on GitHub
            </ButtonLink>
          </div>

          <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
              <dt className="sr-only">Processing</dt>
              <dd className="text-muted-foreground">Runs locally</dd>
            </div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-4 w-4 text-success" aria-hidden="true" />
              <dt className="sr-only">Account</dt>
              <dd className="text-muted-foreground">No account required</dd>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-success" aria-hidden="true" />
              <dt className="sr-only">Quota</dt>
              <dd className="text-muted-foreground">No ArsPDF quota</dd>
            </div>
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="absolute -inset-6 rounded-[2rem] bg-primary/5 blur-2xl" aria-hidden="true" />
          <div className="relative rotate-1 rounded-2xl border border-border bg-surface/90 p-5 shadow-card transition-transform duration-500 hover:rotate-0">
            <div className="flex items-center justify-between border-b border-border/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-[hsl(45_90%_55%)]/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              </div>
              <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Local workspace
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {PREVIEW_TOOLS.map((tool) => (
                <div
                  key={tool.label}
                  className="flex items-center gap-3 rounded-xl border border-border/80 bg-elevated/70 px-3.5 py-3"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary/20 bg-primary/10">
                    <tool.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-medium">{tool.label}</span>
                  <span className="ml-auto rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Ready
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-border bg-background/40 p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-success/10">
                  <ShieldCheck className="h-4 w-4 text-success" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium">Your files stay here</p>
                  <p className="text-xs text-muted-foreground">
                    Processed in this browser tab. Nothing is uploaded.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-3 -left-3 rotate-[-2deg] rounded-xl border border-border bg-elevated px-3.5 py-2 text-xs font-medium shadow-card sm:-left-6">
            <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-success align-middle" />
            No upload step
          </div>
        </div>
      </div>
    </section>
  );
}
