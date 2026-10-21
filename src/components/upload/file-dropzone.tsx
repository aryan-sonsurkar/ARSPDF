"use client";

import { useId, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export function FileDropzone({
  accept,
  multiple = true,
  onFiles,
  disabled = false,
  title,
  hint,
  compact = false,
}: {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  title: string;
  hint: string;
  compact?: boolean;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragActive(false);
    if (disabled) return;
    const dropped = Array.from(event.dataTransfer.files);
    if (dropped.length > 0) onFiles(dropped);
  }

  return (
    <label
      htmlFor={inputId}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        const nextTarget = event.relatedTarget;
        if (nextTarget instanceof Node && event.currentTarget.contains(nextTarget)) {
          return;
        }
        setDragActive(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "group relative block rounded-2xl border border-dashed transition-colors",
        compact ? "p-4" : "p-6 sm:p-10",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        dragActive
          ? "border-primary bg-primary/10"
          : "border-border bg-background/40 hover:border-primary/40 hover:bg-elevated/40",
      )}
      aria-disabled={disabled}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          const selected = Array.from(event.target.files ?? []);
          if (selected.length > 0) onFiles(selected);
          event.target.value = "";
        }}
      />

      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "grid place-items-center rounded-2xl border border-primary/25 bg-primary/10 text-primary transition-transform duration-300 group-hover:-translate-y-0.5",
            compact ? "h-9 w-9" : "h-12 w-12",
          )}
        >
          <Upload className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
        </span>

        <p className={cn("font-medium", compact ? "mt-3 text-sm" : "mt-4 text-base")}>
          {title}
        </p>
        <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
          {hint}
        </p>

        <span
          aria-hidden="true"
          className="mt-4 inline-flex h-11 items-center rounded-lg border border-border bg-elevated px-5 text-sm font-medium text-foreground transition-colors group-hover:border-primary/40 group-hover:bg-primary/10"
        >
          Browse files
        </span>
      </div>
    </label>
  );
}
