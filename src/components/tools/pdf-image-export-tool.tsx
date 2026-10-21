"use client";

import { useMemo, useState } from "react";
import { Images } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  DocumentInfo,
  FileQueueError,
  OptionField,
  ProcessButton,
  selectClasses,
} from "@/components/tools/form-controls";
import { PageRangeField } from "@/components/tools/page-range-field";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { readFileBytes } from "@/lib/pdf/client";
import { exportPdfAsImages } from "@/lib/pdf/image-export";
import type { PdfImageFormat } from "@/lib/pdf/render";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { getTool } from "@/lib/tools";

type ScaleOption = "1" | "1.5" | "2";

function PdfImageExportTool({ format }: { format: PdfImageFormat }) {
  const slug = format === "png" ? "pdf-to-png" : "pdf-to-jpg";
  const tool = getTool(slug)!;
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [scale, setScale] = useState<ScaleOption>("2");
  const [quality, setQuality] = useState("85");
  const [pages, setPages] = useState("");

  const range = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const parsedQuality = Number(quality);
  const qualityValid =
    format === "png" ||
    (Number.isFinite(parsedQuality) && parsedQuality >= 40 && parsedQuality <= 100);

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    qualityValid &&
    (target === "all" || range?.ok === true) &&
    !processor.isProcessing;

  async function handleExport() {
    if (!file) {
      processor.fail("Choose a PDF to convert.");
      return;
    }
    if (!qualityValid) {
      processor.fail("Choose a JPG quality between 40 and 100.");
      return;
    }
    if (target === "selected" && !range?.ok) {
      processor.fail(range && !range.ok ? range.error : "Select pages to export.");
      return;
    }

    const selectedPages =
      target === "selected" && range?.ok ? range.pages : undefined;
    const base = sanitizeBaseName(file.name);

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const result = await exportPdfAsImages(bytes, {
        format,
        scale: Number(scale),
        quality: format === "jpeg" ? parsedQuality / 100 : undefined,
        pages: selectedPages,
      });

      if (result.singlePage) {
        const pageNumber = selectedPages?.[0] ?? 1;
        return {
          bytes: result.bytes,
          filename: `${base}-page-${pageNumber}.${result.extension}`,
          mimeType: result.mimeType,
        };
      }

      return {
        bytes: result.bytes,
        filename: `${base}-${format}.zip`,
        mimeType: result.mimeType,
      };
    });
  }

  function reset() {
    processor.reset();
    queue.clear();
    setPages("");
    setTarget("all");
    setScale("2");
    setQuality("85");
  }

  const extension = format === "png" ? "PNG" : "JPG";

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
        hint={`Every selected page is rendered as a ${extension} image.`}
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

      <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-2">
        <OptionField label="Apply to" htmlFor={`${slug}-target`}>
          <select
            id={`${slug}-target`}
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

        <OptionField
          label="Resolution"
          htmlFor={`${slug}-scale`}
          hint="Higher resolution means larger images."
        >
          <select
            id={`${slug}-scale`}
            value={scale}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setScale(event.target.value as ScaleOption);
            }}
            className={selectClasses}
          >
            <option value="1">Standard (1x)</option>
            <option value="1.5">High (1.5x)</option>
            <option value="2">Very high (2x)</option>
          </select>
        </OptionField>

        {format === "jpeg" ? (
          <OptionField
            label="JPG quality"
            htmlFor={`${slug}-quality`}
            hint="40 to 100. Lower values create smaller files."
          >
            <input
              id={`${slug}-quality`}
              type="number"
              min={40}
              max={100}
              step={5}
              value={quality}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setQuality(event.target.value);
              }}
              className={selectClasses}
            />
          </OptionField>
        ) : null}

        {target === "selected" ? (
          <div className="sm:col-span-2">
            <PageRangeField
              value={pages}
              onChange={(next) => {
                processor.reset();
                setPages(next);
              }}
              pageCount={pageInfo.pageCount}
              label="Pages to export"
              disabled={processor.isProcessing}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {target === "all"
            ? "Every page becomes a separate image."
            : range?.ok
              ? `${range.pages.length} page${range.pages.length === 1 ? "" : "s"} selected.`
              : "Enter a valid page selection."}
        </p>
        <ProcessButton
          onClick={handleExport}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label={`Export ${extension}`}
          processingLabel="Rendering pages…"
          icon={<Images className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={reset}
          processingLabel={`Rendering your PDF to ${extension}`}
          successLabel={`Your ${extension} images are ready`}
        />
      </div>
    </ToolShell>
  );
}

export function PdfToJpgTool() {
  return <PdfImageExportTool format="jpeg" />;
}

export function PdfToPngTool() {
  return <PdfImageExportTool format="png" />;
}
