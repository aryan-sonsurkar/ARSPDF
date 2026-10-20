"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  Loader2,
  RotateCcw,
  RotateCw,
  Trash2,
} from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { PdfPageThumbnail } from "@/components/pdf-viewer/pdf-page-thumbnail";
import { TaskFeedback } from "@/components/tools/task-feedback";
import { FileQueueError, ProcessButton } from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { normalizePdfError } from "@/lib/pdf/errors";
import { getPdfJs } from "@/lib/pdf/pdfjs";
import { readFileBytes } from "@/lib/pdf/client";
import { organizePdf } from "@/lib/pdf/organize";
import { getTool } from "@/lib/tools";
import { cn } from "@/lib/utils";

const tool = getTool("organize-pdf")!;

type OrganizeItem = {
  id: string;
  sourceIndex: number;
  rotation: number;
};

type LoadState = "idle" | "loading" | "ready" | "error";

export function OrganizeTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const processor = useToolProcessor();
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [items, setItems] = useState<OrganizeItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const documentRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    if (!file) {
      setDocument(null);
      setItems([]);
      setLoadState("idle");
      setLoadError(null);
      return;
    }

    let cancelled = false;
    setLoadState("loading");
    setLoadError(null);
    setItems([]);
    setDocument(null);

    async function load() {
      try {
        const pdfjs = await getPdfJs();
        const bytes = new Uint8Array(await file!.arrayBuffer());
        const loadingTask = pdfjs.getDocument({
          data: bytes,
          isEvalSupported: false,
          useSystemFonts: true,
          standardFontDataUrl: "/pdfjs/standard_fonts/",
          cMapUrl: "/pdfjs/cmaps/",
          cMapPacked: true,
        });
        const loaded = await loadingTask.promise;

        if (cancelled) {
          await loaded.destroy();
          return;
        }

        documentRef.current = loaded;
        setDocument(loaded);
        setItems(
          Array.from({ length: loaded.numPages }, (_, index) => ({
            id: `page-${index}`,
            sourceIndex: index,
            rotation: 0,
          })),
        );
        setLoadState("ready");
      } catch (error) {
        if (cancelled) return;
        setLoadState("error");
        setLoadError(normalizePdfError(error));
      }
    }

    void load();

    return () => {
      cancelled = true;
      const activeDocument = documentRef.current;
      documentRef.current = null;
      if (activeDocument) {
        void activeDocument.destroy();
      }
    };
  }, [file]);

  function updateItems(next: OrganizeItem[]) {
    processor.reset();
    setItems(next);
  }

  function moveItem(from: number, to: number) {
    if (from === to || to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    updateItems(next);
  }

  function rotateItem(index: number) {
    const next = items.map((item, itemIndex) =>
      itemIndex === index
        ? { ...item, rotation: (item.rotation + 90) % 360 }
        : item,
    );
    updateItems(next);
  }

  function deleteItem(index: number) {
    if (items.length <= 1) return;
    updateItems(items.filter((_, itemIndex) => itemIndex !== index));
  }

  async function handleApply() {
    if (!file) {
      processor.fail("Choose a PDF to organize.");
      return;
    }
    if (items.length === 0) {
      processor.fail("Keep at least one page to create a PDF.");
      return;
    }

    const snapshot = items.map((item) => ({
      sourceIndex: item.sourceIndex,
      rotation: item.rotation,
    }));

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await organizePdf(bytes, snapshot);
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-organized.pdf`,
      };
    });
  }

  function resetArrangement() {
    if (!document) return;
    updateItems(
      Array.from({ length: document.numPages }, (_, index) => ({
        id: `page-${index}`,
        sourceIndex: index,
        rotation: 0,
      })),
    );
  }

  const disabled = processor.isProcessing || loadState !== "ready";

  return (
    <ToolShell tool={tool}>
      <FileDropzone
        accept="application/pdf,.pdf"
        multiple={false}
        onFiles={(files) => {
          processor.reset();
          queue.add(files);
        }}
        disabled={processor.isProcessing}
        title="Drop a PDF here"
        hint="Pages are rendered as real thumbnails using PDF.js. Reorder, rotate, or remove pages, then apply."
      />
      <FileQueueError message={queue.error} />

      <SelectedFiles
        files={queue.files}
        onRemove={(index) => {
          processor.reset();
          queue.remove(index);
        }}
        disabled={processor.isProcessing}
        label="Source document"
      />

      {loadState === "loading" ? (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-background/50 p-4 text-sm text-muted-foreground" role="status">
          <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          Rendering page previews…
        </div>
      ) : null}

      {loadState === "error" && loadError ? (
        <div role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/[0.07] p-4">
          <p className="text-sm font-medium">This PDF could not be previewed</p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={() => {
              processor.reset();
              queue.clear();
            }}
            className="mt-3 text-xs font-medium text-primary hover:text-[hsl(258_90%_78%)]"
          >
            Choose another file
          </button>
        </div>
      ) : null}

      {loadState === "ready" && document ? (
        <div className="mt-6 border-t border-border/70 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Page order</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {items.length} page{items.length === 1 ? "" : "s"} · drag to reorder,
                rotate with the turn button, or remove pages.
              </p>
            </div>
            <button
              type="button"
              onClick={resetArrangement}
              disabled={processor.isProcessing}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-elevated px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Reset arrangement
            </button>
          </div>

          {document.numPages > 100 ? (
            <p className="mt-3 rounded-lg border border-border bg-background/40 px-3 py-2 text-[11px] text-muted-foreground">
              This document has many pages. Rendering every thumbnail can be slow on
              lower-memory devices.
            </p>
          ) : null}

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item, index) => (
              <li
                key={item.id}
                draggable={!disabled}
                onDragStart={(event) => {
                  if (disabled) return;
                  setDragIndex(index);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(index));
                }}
                onDragOver={(event) => {
                  if (dragIndex === null || disabled) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setOverIndex(index);
                }}
                onDrop={(event) => {
                  if (dragIndex === null || disabled) return;
                  event.preventDefault();
                  moveItem(dragIndex, index);
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                onDragEnd={() => {
                  setDragIndex(null);
                  setOverIndex(null);
                }}
                className={cn(
                  "group rounded-xl border border-border bg-elevated/50 p-2 transition-all",
                  dragIndex === index && "opacity-45",
                  overIndex === index && dragIndex !== index && "border-primary/70 bg-primary/10",
                )}
              >
                <div className="mb-1.5 flex h-5 items-center justify-between gap-2 px-0.5">
                  <span className="text-[11px] font-semibold">Page {index + 1}</span>
                  {item.rotation !== 0 ? (
                    <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {item.rotation}°
                    </span>
                  ) : null}
                </div>

                <div className="relative overflow-hidden rounded-lg border border-border/70 bg-background">
                  <div className="grid aspect-[3/4] place-items-center">
                    <div
                      className="h-full w-full transition-transform duration-200"
                      style={{
                        transform: `rotate(${item.rotation}deg) scale(${
                          item.rotation % 180 === 0 ? 1 : 0.72
                        })`,
                      }}
                    >
                      <PdfPageThumbnail
                        document={document}
                        pageNumber={item.sourceIndex + 1}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between gap-1">
                  <span
                    className="whitespace-nowrap pl-0.5 text-[10px] text-muted-foreground"
                    title={`Source page ${item.sourceIndex + 1}`}
                  >
                    from p.{item.sourceIndex + 1}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={disabled || index === 0}
                      aria-label={`Move page ${index + 1} earlier`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => rotateItem(index)}
                      disabled={disabled}
                      aria-label={`Rotate page ${index + 1} 90 degrees`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(index)}
                      disabled={disabled || items.length <= 1}
                      aria-label={`Delete page ${index + 1}`}
                      title={items.length <= 1 ? "Keep at least one page" : `Delete page ${index + 1}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={disabled || index === items.length - 1}
                      aria-label={`Move page ${index + 1} later`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {items.length} page{items.length === 1 ? "" : "s"} will be written to the
              new PDF.
            </p>
            <ProcessButton
              onClick={handleApply}
              disabled={!file || items.length === 0}
              isProcessing={processor.isProcessing}
              label="Apply changes"
              processingLabel="Building PDF…"
              icon={<LayoutGrid className="h-4 w-4" aria-hidden="true" />}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={() => {
            processor.reset();
            queue.clear();
            setItems([]);
            setDocument(null);
            setLoadState("idle");
          }}
          processingLabel="Applying your page changes"
        />
      </div>
    </ToolShell>
  );
}
