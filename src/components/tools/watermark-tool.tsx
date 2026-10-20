"use client";

import { useMemo, useState } from "react";
import { Droplets } from "lucide-react";
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
import { addTextWatermark, type WatermarkPlacement } from "@/lib/pdf/watermark";
import { getTool } from "@/lib/tools";
import { cn } from "@/lib/utils";

const tool = getTool("watermark-pdf")!;

const PLACEMENTS: Array<{ value: WatermarkPlacement; label: string }> = [
  { value: "diagonal", label: "Diagonal (center)" },
  { value: "center", label: "Center" },
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
];

export function WatermarkTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [text, setText] = useState("CONFIDENTIAL");
  const [placement, setPlacement] = useState<WatermarkPlacement>("diagonal");
  const [opacityPercent, setOpacityPercent] = useState(20);
  const [fontSize, setFontSize] = useState("48");
  const [rotation, setRotation] = useState("45");
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [pages, setPages] = useState("");

  const parsedFontSize = Number(fontSize);
  const parsedRotation = Number(rotation);
  const range = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const validSettings =
    text.trim().length > 0 &&
    text.trim().length <= 200 &&
    Number.isFinite(parsedFontSize) &&
    parsedFontSize >= 8 &&
    parsedFontSize <= 160 &&
    Number.isFinite(parsedRotation) &&
    parsedRotation >= -180 &&
    parsedRotation <= 180;

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
      processor.fail(
        "Enter watermark text (up to 200 characters), a font size from 8 to 160, and a rotation from -180 to 180.",
      );
      return;
    }
    if (target === "selected" && !range?.ok) {
      processor.fail(range && !range.ok ? range.error : "Select pages for the watermark.");
      return;
    }

    const selectedPages = target === "selected" && range?.ok ? range.pages : undefined;

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await addTextWatermark(bytes, {
        text,
        opacity: opacityPercent / 100,
        fontSize: parsedFontSize,
        rotation: parsedRotation,
        placement,
        pages: selectedPages,
      });
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-watermarked.pdf`,
      };
    });
  }

  const previewSize = Math.max(8, Math.min(parsedFontSize * 0.55, 28));

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
        hint="The watermark is drawn over existing content and stays selectable as text in the PDF."
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
          <div className="sm:col-span-2">
            <OptionField label="Watermark text" htmlFor="watermark-text" hint="Up to 200 characters.">
              <input
                id="watermark-text"
                type="text"
                value={text}
                maxLength={200}
                disabled={processor.isProcessing}
                onChange={(event) => {
                  processor.reset();
                  setText(event.target.value);
                }}
                placeholder="CONFIDENTIAL"
                className={inputClasses}
              />
            </OptionField>
          </div>

          <OptionField label="Placement" htmlFor="watermark-placement">
            <select
              id="watermark-placement"
              value={placement}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setPlacement(event.target.value as WatermarkPlacement);
              }}
              className={selectClasses}
            >
              {PLACEMENTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </OptionField>

          <OptionField
            label={`Opacity (${opacityPercent}%)`}
            htmlFor="watermark-opacity"
            hint="Lower opacity keeps page text readable."
          >
            <input
              id="watermark-opacity"
              type="range"
              min={5}
              max={100}
              step={5}
              value={opacityPercent}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setOpacityPercent(Number(event.target.value));
              }}
              className="h-10 w-full accent-primary"
            />
          </OptionField>

          <OptionField label="Font size (pt)" htmlFor="watermark-size" hint="8 to 160 points.">
            <input
              id="watermark-size"
              type="number"
              min={8}
              max={160}
              step={1}
              value={fontSize}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setFontSize(event.target.value);
              }}
              className={inputClasses}
            />
          </OptionField>

          <OptionField label="Rotation (degrees)" htmlFor="watermark-rotation" hint="-180 to 180.">
            <input
              id="watermark-rotation"
              type="number"
              min={-180}
              max={180}
              step={5}
              value={rotation}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setRotation(event.target.value);
              }}
              className={inputClasses}
            />
          </OptionField>

          <OptionField label="Apply to" htmlFor="watermark-target">
            <select
              id="watermark-target"
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
                label="Pages to watermark"
                disabled={processor.isProcessing}
              />
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-xs font-medium text-foreground">Watermark preview</p>
          <p className="text-[11px] text-muted-foreground">Approximate layout only.</p>
          <div className="mt-2 rounded-xl border border-border bg-background/60 p-3">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[150px] overflow-hidden rounded-md border border-border/80 bg-[hsl(40_20%_96%)]">
              <span className="absolute left-3 top-3 h-1 w-12 rounded bg-neutral-300" />
              <span className="absolute left-3 top-6 h-1 w-16 rounded bg-neutral-200" />
              <span className="absolute left-3 top-9 h-1 w-10 rounded bg-neutral-200" />
              <span
                className={cn(
                  "absolute select-none whitespace-nowrap font-semibold text-neutral-600",
                  placement === "center" || placement === "diagonal"
                    ? "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    : placement === "top-left" && "left-2 top-2",
                  placement === "top-right" && "right-2 top-2",
                  placement === "bottom-left" && "bottom-2 left-2",
                  placement === "bottom-right" && "bottom-2 right-2",
                )}
                style={{
                  fontSize: `${previewSize}px`,
                  opacity: opacityPercent / 100,
                  transform: `${
                    placement === "center" || placement === "diagonal"
                      ? "translate(-50%, -50%) "
                      : ""
                  }rotate(${-parsedRotation || 0}deg)`,
                }}
              >
                {text.trim() || "WATERMARK"}
              </span>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            {target === "all"
              ? "Applied to every page."
              : range?.ok
                ? `Applied to ${range.pages.length} page${range.pages.length === 1 ? "" : "s"}.`
                : "Choose valid pages."}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {validSettings
            ? `${text.trim().length} characters · ${opacityPercent}% opacity · ${parsedRotation}°`
            : "Enter valid watermark settings."}
        </p>
        <ProcessButton
          onClick={handleApply}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Apply watermark"
          processingLabel="Applying watermark…"
          icon={<Droplets className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Watermarking your document"
        />
      </div>
    </ToolShell>
  );
}
