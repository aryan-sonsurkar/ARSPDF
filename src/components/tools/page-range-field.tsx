"use client";

import { useId, useMemo } from "react";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { OptionField, inputClasses } from "./form-controls";
import { cn } from "@/lib/utils";

export function PageRangeField({
  value,
  onChange,
  pageCount,
  label = "Pages",
  hint = "Use commas and ranges, for example 1,3,5-8.",
  disabled = false,
  showAllButton = true,
}: {
  value: string;
  onChange: (value: string) => void;
  pageCount: number | null;
  label?: string;
  hint?: string;
  disabled?: boolean;
  showAllButton?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const parsed = useMemo(() => {
    if (pageCount === null) return null;
    return parsePageRanges(value, pageCount);
  }, [pageCount, value]);

  return (
    <OptionField label={label} htmlFor={id} hint={hint}>
      <div className="flex items-stretch gap-2">
        <input
          id={id}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={value}
          disabled={disabled || pageCount === null}
          onChange={(event) => onChange(event.target.value)}
          placeholder="e.g. 1,3,5-8"
          aria-invalid={parsed ? !parsed.ok : undefined}
          aria-describedby={parsed && !parsed.ok ? errorId : hintId}
          className={cn(
            inputClasses,
            "min-w-0 flex-1",
            parsed && !parsed.ok && "border-destructive/60 focus:border-destructive focus:ring-destructive/20",
          )}
        />
        {showAllButton ? (
          <button
            type="button"
            disabled={disabled || pageCount === null}
            onClick={() => {
              if (pageCount !== null) onChange(`1-${pageCount}`);
            }}
            className="h-11 shrink-0 rounded-lg border border-border bg-elevated px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:px-3"
          >
            All
          </button>
        ) : null}
      </div>
      {parsed ? (
        parsed.ok ? (
          <p className="text-[11px] text-muted-foreground">
            {parsed.pages.length} of {pageCount} page{pageCount === 1 ? "" : "s"} selected
          </p>
        ) : (
          <p id={errorId} className="text-[11px] leading-relaxed text-[hsl(0_90%_72%)]">
            {parsed.error}
          </p>
        )
      ) : (
        <p id={hintId} className="sr-only">
          {hint}
        </p>
      )}
    </OptionField>
  );
}
