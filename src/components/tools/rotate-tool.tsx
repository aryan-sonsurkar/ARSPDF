"use client";

import { useMemo, useState } from "react";
import { RotateCw } from "lucide-react";
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
import { parsePageRanges } from "@/lib/pdf/ranges";
import { readFileBytes } from "@/lib/pdf/client";
import { rotatePdf, type RotationAngle } from "@/lib/pdf/rotate";
import { getTool } from "@/lib/tools";

const tool = getTool("rotate-pdf")!;

type RotateTarget = "all" | "selected";

export function RotateTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [target, setTarget] = useState<RotateTarget>("all");
  const [angle, setAngle] = useState<RotationAngle>(90);
  const [pages, setPages] = useState("");

  const parsed = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    (target === "all" || parsed?.ok === true) &&
    !processor.isProcessing;

  function handleTarget(next: RotateTarget) {
    processor.reset();
    setTarget(next);
  }

  async function handleRotate() {
    if (!file) {
      processor.fail("Choose a PDF to rotate.");
      return;
    }
    if (target === "selected" && !parsed?.ok) {
      processor.fail(parsed && !parsed.ok ? parsed.error : "Select at least one page.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await rotatePdf(bytes, {
        rotation: angle,
        pages: target === "selected" && parsed?.ok ? parsed.pages : undefined,
      });
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-rotated.pdf`,
      };
    });
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
        hint="Choose the document whose pages you want to turn."
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
        <OptionField label="Apply to" htmlFor="rotate-target">
          <select
            id="rotate-target"
            value={target}
            disabled={processor.isProcessing}
            onChange={(event) => handleTarget(event.target.value as RotateTarget)}
            className={selectClasses}
          >
            <option value="all">All pages</option>
            <option value="selected">Selected pages</option>
          </select>
        </OptionField>

        <OptionField
          label="Rotation"
          htmlFor="rotate-angle"
          hint="Added to each page's existing rotation."
        >
          <select
            id="rotate-angle"
            value={angle}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setAngle(Number(event.target.value) as RotationAngle);
            }}
            className={selectClasses}
          >
            <option value={90}>90° clockwise</option>
            <option value={180}>180°</option>
            <option value={270}>270° clockwise</option>
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
              label="Pages to rotate"
              disabled={processor.isProcessing}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {target === "all"
            ? "The whole document will be rotated."
            : parsed?.ok
              ? `${parsed.pages.length} page${parsed.pages.length === 1 ? "" : "s"} selected.`
              : "Enter a valid page selection."}
        </p>
        <ProcessButton
          onClick={handleRotate}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Rotate PDF"
          processingLabel="Rotating pages…"
          icon={<RotateCw className="h-4 w-4" aria-hidden="true" />}
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
            setTarget("all");
            setAngle(90);
          }}
          processingLabel="Rotating your document"
        />
      </div>
    </ToolShell>
  );
}
