"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { ToolIcon } from "@/components/tools/tool-icon";
import {
  CATEGORY_LABELS,
  TOOL_CATEGORIES,
  type Tool,
  type ToolCategory,
} from "@/lib/tools";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<Tool["status"], string | null> = {
  available: null,
  "coming-soon": "Coming soon",
  unavailable: "Unavailable",
};

export function ToolExplorer({ tools }: { tools: Tool[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = category === "all" || tool.category === category;
      if (!matchesCategory) return false;
      if (!normalized) return true;
      return (
        tool.title.toLowerCase().includes(normalized) ||
        tool.description.toLowerCase().includes(normalized) ||
        CATEGORY_LABELS[tool.category].toLowerCase().includes(normalized)
      );
    });
  }, [tools, query, category]);

  return (
    <section id="tools" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 border-t border-border/70 pt-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              The toolkit
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Pick a tool. Get to work.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {tools.filter((tool) => tool.status === "available").length} tools run
              entirely in your browser. Conversion tools mark their fidelity limits
              before you run them.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label htmlFor="tool-search" className="sr-only">
              Search PDF tools
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="tool-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, e.g. merge, split, watermark"
                autoComplete="off"
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter tools by category">
          <FilterButton
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All tools"
            count={tools.length}
          />
          {TOOL_CATEGORIES.map((value) => (
            <FilterButton
              key={value}
              active={category === value}
              onClick={() => setCategory(value)}
              label={CATEGORY_LABELS[value]}
              count={tools.filter((tool) => tool.category === value).length}
            />
          ))}
        </div>

        <p className="mt-5 text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
          {category !== "all" ? ` in ${CATEGORY_LABELS[category]}` : ""}
          {query.trim() ? ` matching “${query.trim()}”` : ""}
        </p>

        {filtered.length > 0 ? (
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
            <p className="font-medium">No tools match that search.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different name or clear the category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-4 text-sm font-medium text-primary hover:text-[hsl(258_90%_78%)]"
            >
              Reset search and filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary/40 bg-primary/15 text-foreground"
          : "border-border bg-surface text-muted-foreground hover:border-border hover:bg-elevated hover:text-foreground",
      )}
    >
      {label}
      <span
        className={cn(
          "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
          active ? "bg-primary/20 text-[hsl(258_90%_82%)]" : "bg-elevated text-muted-foreground",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const badge = STATUS_LABEL[tool.status];
  const isAvailable = tool.status === "available";
  const isLimited = isAvailable && Boolean(tool.limitation);

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:bg-elevated/70 hover:shadow-card",
        !isAvailable && "opacity-90 hover:opacity-100",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-11 w-11 place-items-center rounded-xl border transition-colors",
            isAvailable
              ? "border-primary/25 bg-primary/10 text-primary group-hover:border-primary/45 group-hover:bg-primary/15"
              : "border-border bg-elevated text-muted-foreground",
          )}
        >
          <ToolIcon name={tool.icon} className="h-5 w-5" />
        </span>

        {badge ? (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              tool.status === "unavailable"
                ? "border-destructive/25 bg-destructive/10 text-[hsl(0_90%_72%)]"
                : "border-border bg-background/60 text-muted-foreground",
            )}
          >
            {badge}
          </span>
        ) : isLimited ? (
          <span className="rounded-full border border-[hsl(38_92%_50%/0.3)] bg-[hsl(38_92%_50%/0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[hsl(38_92%_72%)]">
            Limited
          </span>
        ) : (
          <span className="rounded-full border border-success/20 bg-success/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-success">
            Ready
          </span>
        )}
      </div>

      <h3 className="mt-4 flex items-center gap-1 text-[0.95rem] font-semibold tracking-tight">
        {tool.title}
        <ArrowUpRight
          className="h-4 w-4 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
          aria-hidden="true"
        />
      </h3>
      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {tool.description}
      </p>
      <span className="mt-4 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
        {CATEGORY_LABELS[tool.category]}
      </span>
    </Link>
  );
}
