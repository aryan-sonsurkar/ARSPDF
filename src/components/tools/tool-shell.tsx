import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import { CATEGORY_LABELS, type Tool } from "@/lib/tools";

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
        <ol className="flex flex-wrap items-center gap-1.5 font-display text-sm tracking-wide text-muted-foreground">
          <li>
            <Link href="/" className="transition-colors hover:text-chalk-yellow">
              Home
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="h-3.5 w-3.5" />
          </li>
          <li>
            <Link href="/#tools" className="transition-colors hover:text-chalk-yellow">
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
        <span className="grid h-14 w-14 shrink-0 -rotate-3 place-items-center rounded-[18px_14px_20px_15px] border-2 border-dashed border-chalk-yellow/50 bg-chalk-yellow/10 text-chalk-yellow">
          <ToolIcon name={tool.icon} className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-marker text-2xl leading-tight tracking-tight chalk-heading sm:text-3xl">
              {tool.title}
            </h1>
            <span className="rounded-full border-2 border-dashed border-chalk-blue/40 bg-chalk-blue/10 px-2.5 py-0.5 font-marker text-[10px] uppercase tracking-wider text-chalk-blue">
              Browser tool
            </span>
            <span className="rounded-full border border-dashed border-foreground/20 px-2.5 py-0.5 font-marker text-[10px] uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[tool.category]}
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </header>

      {tool.limitation ? (
        <div className="sticky-note sticky-note-yellow mt-6 flex rotate-[-0.6deg] items-start gap-2.5 rounded-md px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p className="text-xs font-semibold leading-relaxed">{tool.limitation}</p>
        </div>
      ) : null}

      <div className="slate ruled-lines mt-8 rounded-[1.6rem] border-2 border-foreground/15 p-5 sm:p-7">
        {children}
      </div>

      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-chalk-green" aria-hidden="true" />
        Files are processed in this browser tab for this tool. Nothing is uploaded
        to ArsPDF. Browser memory and file complexity still apply.
      </p>

      <div className="mt-8">
        <Link
          href="/#tools"
          className="font-display text-sm tracking-wide text-muted-foreground transition-colors hover:text-chalk-yellow"
        >
          ← Back to all tools
        </Link>
      </div>
    </div>
  );
}
