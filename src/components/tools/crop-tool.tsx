"use client";

import { useMemo, useState } from "react";
import { Crop } from "lucide-react";
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
import { readFileBytes } from "@/lib/pdf/client";
import { cropPdf, MILLIMETERS_TO_POINTS } from "@/lib/pdf/crop";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { getTool } from "@/lib/tools";

const tool = getTool("crop-pdf")!;

type CropTarget = "all" | "selected";

export function CropTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [target, setTarget] = useState<CropTarget>("all");
  const [top, setTop] = useState("10");
  const [right, setRight] = useState("10");
  const [bottom, setBottom] = useState("10");
  const [left, setLeft] = useState("10");
  const [pages, setPages] = useState("");

  const range = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const margins = [top, right, bottom, left].map((value) => Number(value));
  const marginsValid =
    margins.every((value) => Number.isFinite(value) && value >= 0 && value <= 200) &&
    margins.some((value) => value > 0);

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    marginsValid &&
    (target === "all" || range?.ok === true) &&
    !processor.isProcessing;

  async function handleCrop() {
    if (!file) {
      processor.fail("Choose a PDF to crop.");
      return;
    }
    if (!marginsValid) {
      processor.fail(
        "Enter crop margins from 0 to 200 mm, with at least one margin greater than zero.",
      );
      return;
    }
    if (target === "selected" && !range?.ok) {
      processor.fail(range && !range.ok ? range.error : "Select pages to crop.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await cropPdf(bytes, {
        margins: {
          top: margins[0]! * MILLIMETERS_TO_POINTS,
          right: margins[1]! * MILLIMETERS_TO_POINTS,
          bottom: margins[2]! * MILLIMETERS_TO_POINTS,
          left: margins[3]! * MILLIMETERS_TO_POINTS,
        },
        pages: target === "selected" && range?.ok ? range.pages : undefined,
      });
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-cropped.pdf`,
      };
    });
  }

  function reset() {
    processor.reset();
    queue.clear();
    setPages("");
    setTarget("all");
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
        hint="Margins are trimmed from the edge of each page."
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
        <OptionField label="Apply to" htmlFor="crop-target">
          <select
            id="crop-target"
            value={target}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setTarget(event.target.value as CropTarget);
            }}
            className={selectClasses}
          >
            <option value="all">All pages</option>
            <option value="selected">Selected pages</option>
          </select>
        </OptionField>

        <div className="grid grid-cols-2 gap-3">
          <OptionField label="Top (mm)" htmlFor="crop-top">
            <input
              id="crop-top"
              type="number"
              min={0}
              max={200}
              step={1}
              value={top}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setTop(event.target.value);
              }}
              className={inputClasses}
            />
          </OptionField>
          <OptionField label="Right (mm)" htmlFor="crop-right">
            <input
              id="crop-right"
              type="number"
              min={0}
              max={200}
              step={1}
              value={right}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setRight(event.target.value);
              }}
              className={inputClasses}
            />
          </OptionField>
          <OptionField label="Bottom (mm)" htmlFor="crop-bottom">
            <input
              id="crop-bottom"
              type="number"
              min={0}
              max={200}
              step={1}
              value={bottom}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setBottom(event.target.value);
              }}
              className={inputClasses}
            />
          </OptionField>
          <OptionField label="Left (mm)" htmlFor="crop-left">
            <input
              id="crop-left"
              type="number"
              min={0}
              max={200}
              step={1}
              value={left}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setLeft(event.target.value);
              }}
              className={inputClasses}
            />
          </OptionField>
        </div>

        {target === "selected" ? (
          <div className="sm:col-span-2">
            <PageRangeField
              value={pages}
              onChange={(next) => {
                processor.reset();
                setPages(next);
              }}
              pageCount={pageInfo.pageCount}
              label="Pages to crop"
              disabled={processor.isProcessing}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {marginsValid
            ? "Content outside the new page box is hidden, not deleted."
            : "Enter valid margins before cropping."}
        </p>
        <ProcessButton
          onClick={handleCrop}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Crop PDF"
          processingLabel="Cropping pages…"
          icon={<Crop className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={reset}
          processingLabel="Cropping your document"
        />
      </div>
    </ToolShell>
  );
}
