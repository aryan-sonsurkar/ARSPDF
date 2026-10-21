import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-20 text-center sm:py-28">
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-40" aria-hidden="true" />
      <span className="relative grid h-16 w-16 -rotate-3 place-items-center rounded-[20px_14px_22px_16px] border-2 border-dashed border-chalk-yellow/50 bg-chalk-yellow/10 text-chalk-yellow">
        <FileQuestion className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="relative mt-6 font-marker text-4xl tracking-tight chalk-heading">
        Page not found
      </h1>
      <p className="relative mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        This route does not exist, or the tool you are looking for is not part of
        this build.
      </p>
      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl border-2 border-chalk-yellow bg-chalk-yellow px-5 font-display text-base tracking-wide text-primary-foreground shadow-[0_4px_0_-1px_hsl(44_98%_42%)] transition-all hover:-translate-y-0.5 hover:bg-primary-hover"
        >
          Back home
        </Link>
        <Link
          href="/#tools"
          className="inline-flex h-11 items-center rounded-xl border-2 border-dashed border-foreground/30 bg-surface/60 px-5 font-display text-base tracking-wide transition-all hover:-translate-y-0.5 hover:border-chalk-blue/70"
        >
          Browse tools
        </Link>
      </div>
    </div>
  );
}
