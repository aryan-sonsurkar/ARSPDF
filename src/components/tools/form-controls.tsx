"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileQueueError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2.5 text-xs leading-relaxed text-[hsl(0_90%_75%)]"
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function DocumentInfo({
  status,
  pageCount,
  error,
  singular = "page",
}: {
  status: "idle" | "loading" | "ready" | "error";
  pageCount: number | null;
  error: string | null;
  singular?: string;
}) {
  if (status === "loading") {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground" role="status">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Reading document…
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div
        role="alert"
        className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-3 py-2.5 text-xs leading-relaxed text-[hsl(0_90%_75%)]"
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  if (status === "ready" && pageCount !== null) {
    return (
      <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
        {pageCount} {singular}
        {pageCount === 1 ? "" : "s"} detected
      </p>
    );
  }

  return null;
}

export function OptionField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-foreground"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const inputClasses =
  "h-10 w-full rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

export const selectClasses =
  "h-10 w-full appearance-none rounded-lg border border-border bg-background/60 px-3 text-sm text-foreground transition-colors focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

export function ProcessButton({
  onClick,
  disabled,
  isProcessing,
  label,
  processingLabel = "Processing…",
  icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  isProcessing: boolean;
  label: string;
  processingLabel?: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isProcessing}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {isProcessing ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {isProcessing ? processingLabel : label}
    </button>
  );
}
