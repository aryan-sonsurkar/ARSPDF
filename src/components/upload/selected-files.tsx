"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, GripVertical, X } from "lucide-react";
import { formatBytes } from "@/lib/files/format";
import { cn } from "@/lib/utils";

export function SelectedFiles({
  files,
  onRemove,
  onMove,
  allowReorder = false,
  disabled = false,
  label = "Selected files",
}: {
  files: File[];
  onRemove: (index: number) => void;
  onMove?: (from: number, to: number) => void;
  allowReorder?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  if (files.length === 0) return null;

  const reorderEnabled = allowReorder && Boolean(onMove) && !disabled;

  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="font-marker text-xs uppercase tracking-[0.18em] text-chalk-pink">
          {label}
        </h3>
        <span className="font-display text-sm tracking-wide text-muted-foreground">
          {files.length} file{files.length === 1 ? "" : "s"} ·{" "}
          {formatBytes(files.reduce((total, file) => total + file.size, 0))}
        </span>
      </div>

      <ol className="space-y-2">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
            draggable={reorderEnabled}
            onDragStart={(event) => {
              if (!reorderEnabled) return;
              setDragIndex(index);
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", String(index));
            }}
            onDragOver={(event) => {
              if (!reorderEnabled || dragIndex === null) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setDragOverIndex(index);
            }}
            onDrop={(event) => {
              if (!reorderEnabled || dragIndex === null) return;
              event.preventDefault();
              onMove?.(dragIndex, index);
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setDragOverIndex(null);
            }}
            className={cn(
              "flex items-center gap-3 rounded-xl border-2 border-dashed border-foreground/20 bg-surface/60 px-3 py-2.5 transition-colors",
              dragIndex === index && "opacity-50",
              dragOverIndex === index && dragIndex !== index && "border-chalk-yellow/70 bg-chalk-yellow/10",
            )}
          >
            {reorderEnabled ? (
              <span
                className="cursor-grab text-muted-foreground/60 active:cursor-grabbing"
                aria-hidden="true"
                title="Drag to reorder"
              >
                <GripVertical className="h-4 w-4" />
              </span>
            ) : (
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-dashed border-chalk-yellow/40 bg-chalk-yellow/10 font-marker text-[11px] text-chalk-yellow">
                {index + 1}
              </span>
            )}

            <FileText className="h-4 w-4 shrink-0 text-chalk-blue" aria-hidden="true" />

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[15px] tracking-wide" title={file.name}>
                {file.name}
              </p>
              <p className="text-[11px] text-muted-foreground">{formatBytes(file.size)}</p>
            </div>

            {reorderEnabled ? (
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onMove?.(index, index - 1)}
                  disabled={index === 0}
                  aria-label={`Move ${file.name} up`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-chalk-yellow/15 hover:text-chalk-yellow disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onMove?.(index, index + 1)}
                  disabled={index === files.length - 1}
                  aria-label={`Move ${file.name} down`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-chalk-yellow/15 hover:text-chalk-yellow disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => onRemove(index)}
              disabled={disabled}
              aria-label={`Remove ${file.name}`}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ol>

      {reorderEnabled ? (
        <p className="mt-2 text-[11px] text-muted-foreground">
          Drag rows or use the arrows to set the order. The first item is processed first.
        </p>
      ) : null}
    </div>
  );
}
