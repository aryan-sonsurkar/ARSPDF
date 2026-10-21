import Link from "next/link";
import { ArrowLeft, ChevronRight, Info } from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import { getAvailableTools, type Tool } from "@/lib/tools";

export function UnavailableTool({ tool }: { tool: Tool }) {
  const available = getAvailableTools();
  const isComingSoon = tool.status === "coming-soon";

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link href="/#tools" className="transition-colors hover:text-foreground">
              Tools
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li aria-current="page" className="text-foreground">
            {tool.title}
          </li>
        </ol>
      </nav>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-border bg-elevated text-muted-foreground">
            <ToolIcon name={tool.icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                {tool.title}
              </h1>
              <span
                className={
                  isComingSoon
                    ? "rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                    : "rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(0_90%_72%)]"
                }
              >
                {isComingSoon ? "Coming soon" : "Not available"}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3 rounded-xl border border-border bg-background/50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">
              {isComingSoon
                ? "This tool is not implemented in this build."
                : "This feature is intentionally not shipped."}
            </p>
            <p className="mt-1">
              {tool.note ??
                "A reliable browser-compatible implementation is not available in the current stack."}
            </p>
            <p className="mt-2 text-xs">
              There is no upload field here because there is no working processor
              behind it. ArsPDF will not fake a conversion or claim security it cannot
              enforce.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-semibold">Available right now</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {available.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/${item.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3.5 py-3 text-sm transition-colors hover:border-primary/35 hover:bg-elevated/60"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                    <ToolIcon name={item.icon} className="h-4 w-4" />
                  </span>
                  <span className="font-medium">{item.title}</span>
                  <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/#tools"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to all tools
        </Link>
      </div>
    </div>
  );
}
