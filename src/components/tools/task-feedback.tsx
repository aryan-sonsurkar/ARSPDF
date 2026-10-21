"use client";

import { AlertCircle, CheckCircle2, Download, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadBytes } from "@/lib/files/download";
import { formatBytes } from "@/lib/files/format";
import type { ToolResult } from "@/types/pdf";
import type { ProcessorStatus } from "@/hooks/use-tool-processor";

export function TaskFeedback({
  status,
  error,
  result,
  onReset,
  processingLabel = "Processing your document",
  successLabel = "Your PDF is ready",
  resetLabel = "Start over",
}: {
  status: ProcessorStatus;
  error: string | null;
  result: ToolResult | null;
  onReset: () => void;
  processingLabel?: string;
  successLabel?: string;
  resetLabel?: string;
}) {
  if (status === "processing") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-xl border border-primary/25 bg-primary/5 p-4"
      >
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{processingLabel}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              This runs in your browser. Large or complex files can take a moment.
            </p>
            <div
              className="mt-3 h-1 overflow-hidden rounded-full bg-border"
              aria-hidden="true"
            >
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-to-r from-transparent via-primary to-transparent bg-[length:200%_100%]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error" && error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/[0.07] p-4"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">That did not work</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{error}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Adjust your selection and try again. Nothing was uploaded or saved.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === "success" && result) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/[0.06] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{successLabel}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground" title={result.filename}>
                {result.filename} · {formatBytes(result.bytes.byteLength)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Button
              onClick={() =>
                downloadBytes(
                  result.bytes,
                  result.filename,
                  result.mimeType ?? "application/pdf",
                )
              }
              size="sm"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download
            </Button>
            <Button onClick={onReset} variant="secondary" size="sm">
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {resetLabel}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
