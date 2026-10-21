import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-20 text-center sm:py-28">
      <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface text-muted-foreground">
        <FileQuestion className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        This route does not exist, or the tool you are looking for is not part of
        this build.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Back home
        </Link>
        <Link
          href="/#tools"
          className="inline-flex h-11 items-center rounded-lg border border-border bg-elevated px-5 text-sm font-medium transition-colors hover:bg-[hsl(222_22%_17%)]"
        >
          Browse tools
        </Link>
      </div>
    </div>
  );
}
