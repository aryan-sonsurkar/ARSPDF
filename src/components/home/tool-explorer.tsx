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

const CATEGORY_STYLE: Record<
  ToolCategory,
  { text: string; border: string; bg: string; tape: string }
> = {
  organize: {
    text: "text-chalk-yellow",
    border: "border-chalk-yellow/40",
    bg: "bg-chalk-yellow/10",
    tape: "bg-chalk-yellow/70",
  },
  edit: {
    text: "text-chalk-blue",
    border: "border-chalk-blue/40",
    bg: "bg-chalk-blue/10",
    tape: "bg-chalk-blue/70",
  },
  convert: {
    text: "text-chalk-pink",
    border: "border-chalk-pink/40",
    bg: "bg-chalk-pink/10",
    tape: "bg-chalk-pink/70",
  },
  optimize: {
    text: "text-chalk-green",
    border: "border-chalk-green/40",
    bg: "bg-chalk-green/10",
    tape: "bg-chalk-green/70",
  },
  security: {
    text: "text-chalk-orange",
    border: "border-chalk-orange/40",
    bg: "bg-chalk-orange/10",
    tape: "bg-chalk-orange/70",
  },
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
        <div className="flex flex-col gap-6 pt-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="font-marker text-xs uppercase tracking-[0.22em] text-chalk-pink">
              The toolkit
            </p>
            <h2 className="mt-3 font-marker text-3xl leading-tight tracking-tight chalk-heading sm:text-4xl">
              Pick a tool. <span className="doodle-underline text-chalk-yellow">Get to work.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
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
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-chalk-blue"
                aria-hidden="true"
              />
              <input
                id="tool-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search tools, e.g. merge, split, watermark"
                autoComplete="off"
                className="h-12 w-full rounded-2xl border-2 border-dashed border-foreground/25 bg-surface/70 pl-10 pr-11 font-display text-base tracking-wide text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-chalk-blue/70 focus:outline-none focus:ring-2 focus:ring-chalk-blue/20 sm:text-base"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label="Filter tools by category"
        >
          <FilterButton
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All tools"
            count={tools.length}
            tone="all"
          />
          {TOOL_CATEGORIES.map((value) => (
            <FilterButton
              key={value}
              active={category === value}
              onClick={() => setCategory(value)}
              label={CATEGORY_LABELS[value]}
              count={tools.filter((tool) => tool.category === value).length}
              tone={value}
            />
          ))}
        </div>

        <p className="mt-5 font-display text-sm tracking-wide text-muted-foreground" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "tool" : "tools"}
          {category !== "all" ? ` in ${CATEGORY_LABELS[category]}` : ""}
          {query.trim() ? ` matching “${query.trim()}”` : ""}
        </p>

        {filtered.length > 0 ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool, index) => (
              <li key={tool.slug}>
                <ToolCard tool={tool} index={index} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="chalk-box mt-5 bg-surface/50 px-6 py-14 text-center">
            <p className="font-display text-lg tracking-wide">No tools match that search.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different name or clear the category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
              }}
              className="mt-4 text-sm font-semibold text-chalk-yellow hover:text-primary-hover"
            >
              Reset search and filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

type Tone = ToolCategory | "all";

const TONE_STYLE: Record<Tone, string> = {
  all: "border-chalk-purple/40 bg-chalk-purple/15 text-foreground",
  organize: "border-chalk-yellow/50 bg-chalk-yellow/15 text-chalk-yellow",
  edit: "border-chalk-blue/50 bg-chalk-blue/15 text-chalk-blue",
  convert: "border-chalk-pink/50 bg-chalk-pink/15 text-chalk-pink",
  optimize: "border-chalk-green/50 bg-chalk-green/15 text-chalk-green",
  security: "border-chalk-orange/50 bg-chalk-orange/15 text-chalk-orange",
};

function FilterButton({
  active,
  onClick,
  label,
  count,
  tone,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  tone: Tone;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border-2 px-4 font-display text-sm tracking-wide transition-all",
        active
          ? TONE_STYLE[tone]
          : "border-dashed border-foreground/20 bg-surface/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
      )}
    >
      {label}
      <span className="rounded-full bg-background/40 px-1.5 py-0.5 text-[10px] tabular-nums">
        {count}
      </span>
    </button>
  );
}

function ToolCard({ tool, index }: { tool: Tool; index: number }) {
  const badge = STATUS_LABEL[tool.status];
  const isAvailable = tool.status === "available";
  const isLimited = isAvailable && Boolean(tool.limitation);
  const style = CATEGORY_STYLE[tool.category];
  const tilt = index % 3 === 0 ? "-rotate-1" : index % 3 === 1 ? "rotate-0" : "rotate-1";

  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "slate group relative flex h-full flex-col rounded-[1.4rem] border-2 p-5 transition-all duration-300 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-chalkboard",
        style.border,
        tilt,
        !isAvailable && "opacity-90 hover:opacity-100",
      )}
    >
      {/* washi tape */}
      <span
        className={cn(
          "absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 -rotate-2 opacity-70",
          style.tape,
        )}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "grid h-12 w-12 place-items-center rounded-[16px_12px_18px_13px] border-2 border-dashed transition-transform group-hover:-rotate-6",
            isAvailable ? `${style.border} ${style.bg} ${style.text}` : "border-border bg-elevated text-muted-foreground",
          )}
        >
          <ToolIcon name={tool.icon} className="h-5 w-5" />
        </span>

        {badge ? (
          <span className="rounded-full border-2 px-2 py-0.5 font-marker text-[10px] uppercase tracking-wide border-destructive/40 bg-destructive/10 text-[hsl(348_100%_80%)]">
            {badge}
          </span>
        ) : isLimited ? (
          <span className="sticky-note sticky-note-yellow -mr-1 -mt-1 rounded px-2 py-0.5 font-marker text-[10px] uppercase tracking-wide">
            Limited
          </span>
        ) : (
          <span className="rounded-full border-2 border-dashed border-chalk-green/40 bg-chalk-green/10 px-2 py-0.5 font-marker text-[10px] uppercase tracking-wide text-chalk-green">
            Ready
          </span>
        )}
      </div>

      <h3 className="mt-4 flex items-center gap-1 font-display text-xl tracking-wide">
        {tool.title}
        <ArrowUpRight
          className={cn(
            "h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100",
            style.text,
          )}
          aria-hidden="true"
        />
      </h3>
      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted-foreground">
        {tool.description}
      </p>
      <span
        className={cn(
          "mt-4 inline-flex w-fit items-center rounded-full border border-dashed px-2.5 py-1 font-marker text-[10px] uppercase tracking-wider",
          style.border,
          style.text,
        )}
      >
        {CATEGORY_LABELS[tool.category]}
      </span>
    </Link>
  );
}
