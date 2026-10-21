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
        "group relative block rounded-[1.7rem] border-2 border-dashed transition-all",
        compact ? "p-5" : "p-6 sm:p-10",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        dragActive
          ? "border-chalk-yellow bg-chalk-yellow/10"
          : "border-foreground/30 bg-background/30 hover:-translate-y-0.5 hover:border-chalk-blue/70 hover:bg-elevated/40",
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
            "grid -rotate-3 place-items-center rounded-[18px_14px_20px_15px] border-2 border-dashed border-chalk-yellow/50 bg-chalk-yellow/10 text-chalk-yellow transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105",
            compact ? "h-10 w-10" : "h-14 w-14",
          )}
        >
          <Upload className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden="true" />
        </span>

        <p className={cn("font-display tracking-wide", compact ? "mt-3 text-base" : "mt-4 text-xl")}>
          {title}
        </p>
        <p className="mt-1 max-w-md text-xs font-semibold leading-relaxed text-muted-foreground sm:text-[13px]">
          {hint}
        </p>

        <span
          aria-hidden="true"
          className="mt-4 inline-flex h-11 items-center rounded-xl border-2 border-chalk-yellow bg-chalk-yellow px-5 font-display text-base tracking-wide text-primary-foreground shadow-[0_4px_0_-1px_hsl(44_98%_42%)] transition-colors group-hover:bg-primary-hover"
        >
          Browse files
        </span>
        {!compact ? (
          <span className="mt-2 font-accent text-base text-muted-foreground/80">
            …or drag &amp; drop onto the board
          </span>
        ) : null}
      </div>
    </label>
  );
}
