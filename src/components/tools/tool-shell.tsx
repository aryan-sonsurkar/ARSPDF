import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import type { Tool } from "@/lib/tools";

export function ToolShell({
  tool,
  children,
}: {
  tool: Tool;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
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

      <header className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary">
          <ToolIcon name={tool.icon} className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {tool.title}
            </h1>
            <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
              Browser tool
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </header>

      {tool.limitation ? (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-[hsl(38_92%_50%/0.3)] bg-[hsl(38_92%_50%/0.08)] px-4 py-3 text-xs leading-relaxed text-[hsl(38_92%_75%)]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{tool.limitation}</p>
        </div>
      ) : null}

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-7">
        {children}
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden="true" />
        Files are processed in this browser tab for this tool. Nothing is uploaded
        to ArsPDF. Browser memory and file complexity still apply.
      </p>

      <div className="mt-8">
        <Link
          href="/#tools"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to all tools
        </Link>
      </div>
    </div>
  );
}
