import Link from "next/link";
import { ArrowRight, Gauge, HardDrive, ShieldCheck, UserX } from "lucide-react";

const FEATURES = [
  {
    icon: HardDrive,
    title: "Processed in your browser",
    description:
      "Every tool in this build manipulates the document locally with PDF and office libraries. There is no upload endpoint for document operations.",
  },
  {
    icon: UserX,
    title: "No mandatory account",
    description:
      "Open a tool and use it. No sign-up, email verification, or subscription gate stands between you and the result.",
  },
  {
    icon: Gauge,
    title: "No artificial daily quota",
    description:
      "ArsPDF does not impose a task counter. Your real limits are browser memory, file complexity, and your device.",
  },
  {
    icon: ShieldCheck,
    title: "Honest about limits",
    description:
      "Encryption runs locally, and every office conversion states what it cannot preserve. Limits are labeled before you run a tool, not hidden after.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Why ArsPDF
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            A smaller promise, kept properly.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            No invented statistics or vague security claims. Just a focused set of
            document tools with a clear processing model.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border hover:bg-elevated/50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 text-sm font-semibold">{feature.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.08] via-surface to-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Want the exact privacy details?
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Read what runs locally, how to clear your workspace, and why browser
              processing is not the same as unlimited document size.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-[hsl(258_90%_78%)]"
          >
            About &amp; privacy
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
