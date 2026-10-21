"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileQueueError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/10 px-3 py-2.5 text-xs font-semibold leading-relaxed text-[hsl(348_100%_82%)]"
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
      <div className="mt-3 flex items-center gap-2 font-display text-sm tracking-wide text-muted-foreground" role="status">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-chalk-yellow" aria-hidden="true" />
        Reading document…
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div
        role="alert"
        className="mt-3 flex items-start gap-2 rounded-xl border-2 border-dashed border-destructive/50 bg-destructive/10 px-3 py-2.5 text-xs font-semibold leading-relaxed text-[hsl(348_100%_82%)]"
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  if (status === "ready" && pageCount !== null) {
    return (
      <p className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-dashed border-chalk-green/40 bg-chalk-green/10 px-3 py-1 font-marker text-xs uppercase tracking-wider text-chalk-green">
        <span className="h-1.5 w-1.5 rounded-full bg-chalk-green" aria-hidden="true" />
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
        className="block font-display text-sm tracking-wide text-foreground"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export const inputClasses =
  "h-11 w-full rounded-xl border-2 border-dashed border-foreground/25 bg-background/50 px-3 text-base text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-chalk-blue/70 focus:outline-none focus:ring-2 focus:ring-chalk-blue/20 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:text-sm";

export const selectClasses =
  "h-11 w-full appearance-none rounded-xl border-2 border-dashed border-foreground/25 bg-background/50 px-3 text-base text-foreground transition-colors focus:border-chalk-blue/70 focus:outline-none focus:ring-2 focus:ring-chalk-blue/20 disabled:cursor-not-allowed disabled:opacity-50 sm:h-11 sm:text-sm";

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
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-chalk-yellow bg-chalk-yellow px-5 font-display text-base tracking-wide text-primary-foreground shadow-[0_6px_0_-1px_hsl(44_98%_42%),0_16px_30px_-18px_hsl(var(--chalk-yellow)/0.9)] transition-all hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-0.5 active:shadow-[0_2px_0_-1px_hsl(44_98%_42%)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
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
