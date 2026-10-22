import {
  Check,
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
import { getAvailableTools } from "@/lib/tools";

const PREVIEW_TOOLS = [
  { label: "Merge PDF", icon: Files, color: "text-chalk-yellow" },
  { label: "Split PDF", icon: Scissors, color: "text-chalk-pink" },
  { label: "Organize PDF", icon: LayoutGrid, color: "text-chalk-blue" },
  { label: "Image to PDF", icon: ImagePlus, color: "text-chalk-green" },
];

const TICKER = [
  "FREE PDF TOOLKIT",
  "NO PAYWALLS",
  "RUNS IN YOUR BROWSER",
  "NO ACCOUNT NEEDED",
  `${getAvailableTools().length} TOOLS`,
  "ZERO UPLOADS",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 grid-backdrop opacity-60"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -top-24 h-[440px] w-[440px] rounded-full bg-chalk-green/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-40 top-40 h-[380px] w-[380px] rounded-full bg-chalk-purple/10 blur-3xl"
        aria-hidden="true"
      />

      {/* Chalk ticker */}
      <div className="relative border-b-2 border-dashed border-foreground/15 bg-[hsl(152_26%_5%)]/60 py-2">
        <div className="flex w-max animate-marquee gap-8 pr-8" aria-hidden="true">
          {[...TICKER, ...TICKER].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex items-center gap-8 font-marker text-[11px] tracking-[0.2em] text-muted-foreground"
            >
              {item}
              <Sparkles className="h-3 w-3 text-chalk-yellow" />
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-8 lg:pb-24">
        <div className="max-w-2xl">
          <div className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-dashed border-chalk-yellow/50 bg-chalk-yellow/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-chalk-yellow">
            <span className="h-2 w-2 animate-blink rounded-full bg-chalk-pink" aria-hidden="true" />
            Class in session · Free forever
          </div>

          <h1 className="mt-6 font-marker text-4xl leading-[1.1] tracking-tight text-balance chalk-heading sm:text-5xl lg:text-[3.4rem]">
            Every PDF tool.
            <br />
            <span className="text-chalk-yellow">
              <span className="doodle-underline">No paywalls.</span>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Merge, split, organize, rotate, watermark, and build PDFs from images
            without an account or an artificial daily limit. Every tool runs on your
            device — nothing gets uploaded.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#tools" size="lg">
              ✏️ Explore the tools
            </ButtonLink>
            <ButtonLink href={GITHUB_URL} variant="secondary" size="lg" external>
              <GitHubIcon className="h-4 w-4" />
              View on GitHub
            </ButtonLink>
          </div>

          <dl className="mt-9 flex flex-wrap gap-2.5">
            <HeroFact icon={ShieldCheck} label="Runs locally" color="text-chalk-green" />
            <HeroFact icon={LockKeyhole} label="No account" color="text-chalk-blue" />
            <HeroFact icon={Sparkles} label="No quota" color="text-chalk-pink" />
          </dl>
        </div>

        {/* Chalkboard preview */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div
            className="absolute -inset-5 rotate-2 rounded-[2.2rem] bg-chalk-green/5 blur-2xl"
            aria-hidden="true"
          />

          <div className="slate relative -rotate-1 rounded-[2rem] border-2 border-foreground/20 p-5 transition-transform duration-500 hover:rotate-0">
            {/* tape corners */}
            <span className="tape absolute -left-3 -top-3 h-6 w-16 -rotate-45" aria-hidden="true" />
            <span className="tape absolute -right-3 -top-3 h-6 w-16 rotate-45" aria-hidden="true" />

            <div className="flex items-center justify-between border-b-2 border-dashed border-foreground/15 pb-4">
              <span className="font-marker text-[13px] uppercase tracking-widest text-muted-foreground">
                Today&apos;s lesson
              </span>
              <span className="rounded-full border border-dashed border-chalk-yellow/50 bg-chalk-yellow/10 px-2.5 py-0.5 font-marker text-[10px] tracking-wider text-chalk-yellow">
                PDF 101
              </span>
            </div>

            <p className="mt-4 font-display text-xl tracking-wide text-foreground chalk-text">
              Pick a tool. Drop a file. Done.
            </p>

            <div className="mt-4 space-y-2.5">
              {PREVIEW_TOOLS.map((tool, index) => (
                <div
                  key={tool.label}
                  className="flex items-center gap-3 rounded-xl border border-foreground/10 bg-background/40 px-3.5 py-2.5"
                  style={{ transform: `rotate(${index % 2 === 0 ? -0.6 : 0.6}deg)` }}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-foreground/15 bg-background/60">
                    <tool.icon className={`h-4 w-4 ${tool.color}`} aria-hidden="true" />
                  </span>
                  <span className="font-display text-[15px] tracking-wide">{tool.label}</span>
                  <span className="ml-auto flex items-center gap-1 font-marker text-[10px] uppercase tracking-wider text-chalk-green">
                    <Check className="h-3 w-3" aria-hidden="true" /> Ready
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border-2 border-dashed border-chalk-green/40 bg-chalk-green/[0.07] p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-chalk-green/15">
                  <ShieldCheck className="h-4 w-4 text-chalk-green" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-[15px] tracking-wide">Your files stay here</p>
                  <p className="text-xs text-muted-foreground">
                    Processed in this browser tab. Nothing is uploaded.
                  </p>
                </div>
              </div>
            </div>

            {/* chalk tray */}
            <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
              {["bg-chalk-yellow", "bg-chalk-pink", "bg-chalk-blue", "bg-chalk-green", "bg-chalk-orange"].map(
                (color, index) => (
                  <span
                    key={color}
                    className={`h-2 w-8 rounded-full ${color} opacity-80 ${index % 2 ? "-rotate-2" : "rotate-1"}`}
                  />
                ),
              )}
            </div>
          </div>

          <div className="sticky-note sticky-note-yellow absolute -bottom-5 -left-3 w-36 rotate-[-6deg] rounded-md px-3 py-2.5 sm:-left-8">
            <p className="font-accent text-lg font-bold leading-tight">
              No upload step!
            </p>
            <p className="mt-0.5 text-[11px] font-semibold opacity-70">
              It all happens on your device.
            </p>
          </div>

          <span
            className="pointer-events-none absolute -right-2 top-1/2 hidden rotate-12 animate-float font-marker text-3xl text-chalk-pink lg:block"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </div>
    </section>
  );
}

function HeroFact({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof ShieldCheck;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-dashed border-foreground/20 bg-surface/50 px-3 py-1.5">
      <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
      <dt className="sr-only">{label}</dt>
      <dd className="text-xs font-semibold text-muted-foreground">{label}</dd>
    </div>
  );
}
