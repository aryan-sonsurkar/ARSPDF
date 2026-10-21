import Link from "next/link";
import { ArrowRight, Gauge, HardDrive, ShieldCheck, UserX } from "lucide-react";

const FEATURES = [
  {
    icon: HardDrive,
    title: "Processed in your browser",
    description:
      "Every tool in this build manipulates the document locally with PDF and office libraries. There is no upload endpoint for document operations.",
    note: "sticky-note-green",
    pin: "bg-chalk-green",
    tilt: "-rotate-2",
  },
  {
    icon: UserX,
    title: "No mandatory account",
    description:
      "Open a tool and use it. No sign-up, email verification, or subscription gate stands between you and the result.",
    note: "sticky-note-yellow",
    pin: "bg-chalk-yellow",
    tilt: "rotate-1",
  },
  {
    icon: Gauge,
    title: "No artificial daily quota",
    description:
      "ArsPDF does not impose a task counter. Your real limits are browser memory, file complexity, and your device.",
    note: "sticky-note-blue",
    pin: "bg-chalk-blue",
    tilt: "-rotate-1",
  },
  {
    icon: ShieldCheck,
    title: "Honest about limits",
    description:
      "Encryption runs locally, and every office conversion states what it cannot preserve. Limits are labeled before you run a tool, not hidden after.",
    note: "sticky-note-pink",
    pin: "bg-chalk-pink",
    tilt: "rotate-2",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
        <div className="max-w-2xl">
          <p className="font-marker text-xs uppercase tracking-[0.22em] text-chalk-blue">
            Why ArsPDF
          </p>
          <h2 className="mt-3 font-marker text-3xl leading-tight tracking-tight chalk-heading sm:text-4xl">
            A smaller promise,
            <br />
            <span className="doodle-underline-pink text-chalk-yellow">kept properly.</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            No invented statistics or vague security claims. Just a focused set of
            document tools with a clear processing model — pinned to the board below.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={`sticky-note ${feature.note} ${feature.tilt} relative rounded-md p-5 transition-transform duration-300 hover:rotate-0 hover:-translate-y-1`}
            >
              {/* push pin */}
              <span
                className={`absolute left-1/2 -top-2 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white/50 shadow ${feature.pin}`}
                aria-hidden="true"
              />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-paper-ink/10 text-paper-ink">
                <feature.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg leading-tight tracking-wide text-paper-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-[13px] font-semibold leading-relaxed text-paper-ink/75">
                {feature.description}
              </p>
            </article>
          ))}
        </div>

        <div className="chalk-box mt-8 flex flex-col gap-5 bg-surface/50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="max-w-2xl">
            <h3 className="font-display text-xl tracking-wide">
              Want the exact privacy details?
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Read what runs locally, how to clear your workspace, and why browser
              processing is not the same as unlimited document size.
            </p>
          </div>
          <Link
            href="/about"
            className="inline-flex shrink-0 items-center gap-2 font-display text-base tracking-wide text-chalk-yellow transition-colors hover:text-primary-hover"
          >
            About &amp; privacy
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
