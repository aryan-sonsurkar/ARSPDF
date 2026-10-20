"use client";

import { useMemo, useState } from "react";
import { Hash } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  DocumentInfo,
  FileQueueError,
  OptionField,
  ProcessButton,
  inputClasses,
  selectClasses,
} from "@/components/tools/form-controls";
import { PageRangeField } from "@/components/tools/page-range-field";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { readFileBytes } from "@/lib/pdf/client";
import { addPageNumbers } from "@/lib/pdf/page-numbers";
import { getTool } from "@/lib/tools";
import type { PdfPagePosition } from "@/types/pdf";
import { cn } from "@/lib/utils";

const tool = getTool("add-page-numbers")!;

const POSITIONS: Array<{ value: PdfPagePosition; label: string }> = [
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

export function PageNumbersTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [startNumber, setStartNumber] = useState("1");
  const [position, setPosition] = useState<PdfPagePosition>("bottom-center");
  const [fontSize, setFontSize] = useState("12");
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [pages, setPages] = useState("");

  const parsedStart = Number(startNumber);
  const parsedFontSize = Number(fontSize);
  const range = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const validSettings =
    Number.isInteger(parsedStart) &&
    parsedStart >= 0 &&
    Number.isFinite(parsedFontSize) &&
    parsedFontSize >= 6 &&
    parsedFontSize <= 72;

  const selectionValid = target === "all" || range?.ok === true;

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    validSettings &&
    selectionValid &&
    !processor.isProcessing;

  async function handleApply() {
    if (!file) {
      processor.fail("Choose a PDF first.");
      return;
    }
    if (!validSettings) {
      processor.fail("Use a whole starting number of 0 or more and a font size from 6 to 72.");
      return;
    }
    if (target === "selected" && !range?.ok) {
      processor.fail(range && !range.ok ? range.error : "Select pages to number.");
      return;
    }

    const selectedPages = target === "selected" && range?.ok ? range.pages : undefined;

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await addPageNumbers(bytes, {
        startNumber: parsedStart,
        position,
        fontSize: parsedFontSize,
        pages: selectedPages,
      });
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-numbered.pdf`,
      };
    });
  }

  function updateSetting<T>(setter: (value: T) => void) {
    return (value: T) => {
      processor.reset();
      setter(value);
    };
  }

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
        hint="Numbers are drawn on top of the existing page content. Nothing is flattened or re-rendered."
      />
      <FileQueueError message={queue.error} />

      <SelectedFiles
        files={queue.files}
        onRemove={(index) => {
          processor.reset();
          queue.remove(index);
          setPages("");
        }}
        disabled={processor.isProcessing}
        label="Source document"
      />

      {file ? (
        <DocumentInfo
          status={pageInfo.status}
          pageCount={pageInfo.pageCount}
          error={pageInfo.error}
        />
      ) : null}

      <div className="mt-6 grid gap-6 border-t border-border/70 pt-5 lg:grid-cols-[1fr_210px]">
        <div className="grid gap-4 sm:grid-cols-2">
          <OptionField label="Starting number" htmlFor="number-start" hint="Numbers count up from here.">
            <input
              id="number-start"
              type="number"
              min={0}
              max={999999}
              step={1}
              value={startNumber}
              disabled={processor.isProcessing}
              onChange={(event) => updateSetting(setStartNumber)(event.target.value)}
              className={inputClasses}
            />
          </OptionField>

          <OptionField label="Font size (pt)" htmlFor="number-size" hint="Between 6 and 72 points.">
            <input
              id="number-size"
              type="number"
              min={6}
              max={72}
              step={1}
              value={fontSize}
              disabled={processor.isProcessing}
              onChange={(event) => updateSetting(setFontSize)(event.target.value)}
              className={inputClasses}
            />
          </OptionField>

          <OptionField label="Position" htmlFor="number-position">
            <select
              id="number-position"
              value={position}
              disabled={processor.isProcessing}
              onChange={(event) =>
                updateSetting(setPosition)(event.target.value as PdfPagePosition)
              }
              className={selectClasses}
            >
              {POSITIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </OptionField>

          <OptionField label="Apply to" htmlFor="number-target">
            <select
              id="number-target"
              value={target}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setTarget(event.target.value as "all" | "selected");
              }}
              className={selectClasses}
            >
              <option value="all">All pages</option>
              <option value="selected">Selected pages</option>
            </select>
          </OptionField>

          {target === "selected" ? (
            <div className="sm:col-span-2">
              <PageRangeField
                value={pages}
                onChange={(next) => {
                  processor.reset();
                  setPages(next);
                }}
                pageCount={pageInfo.pageCount}
                label="Pages to number"
                disabled={processor.isProcessing}
              />
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">Layout preview</p>
          <p className="text-[11px] text-muted-foreground">Approximate position only.</p>
          <div className="mt-2 rounded-xl border border-border bg-background/60 p-3">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[150px] overflow-hidden rounded-md border border-border/80 bg-[hsl(40_20%_96%)]">
              <span className="absolute left-3 top-3 h-1 w-12 rounded bg-neutral-300" />
              <span className="absolute left-3 top-6 h-1 w-16 rounded bg-neutral-200" />
              <span className="absolute left-3 top-9 h-1 w-10 rounded bg-neutral-200" />
              <span
                className={cn(
                  "absolute font-sans font-semibold text-neutral-600",
                  position.startsWith("top") ? "top-2" : "bottom-2",
                  position.endsWith("left") && "left-2",
                  position.endsWith("center") && "left-1/2 -translate-x-1/2",
                  position.endsWith("right") && "right-2",
                )}
                style={{
                  fontSize: `${Math.max(7, Math.min(parsedFontSize * 0.85, 28))}px`,
                }}
              >
                {Number.isFinite(parsedStart) ? parsedStart : 1}
              </span>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {target === "all"
              ? "All pages will be numbered."
              : range?.ok
                ? `${range.pages.length} page${range.pages.length === 1 ? "" : "s"} will be numbered.`
                : "Choose valid pages to number."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {validSettings
            ? `Starts at ${parsedStart} · ${parsedFontSize} pt`
            : "Adjust the starting number or font size."}
        </p>
        <ProcessButton
          onClick={handleApply}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Add page numbers"
          processingLabel="Numbering pages…"
          icon={<Hash className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={() => {
            processor.reset();
            queue.clear();
            setPages("");
          }}
          processingLabel="Adding page numbers"
        />
      </div>
    </ToolShell>
  );
}
