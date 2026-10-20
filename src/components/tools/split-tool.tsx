"use client";

import { useEffect, useMemo, useState } from "react";
import { Scissors } from "lucide-react";
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
import { extractPdfPages, splitPdfIntoPages } from "@/lib/pdf/split";
import { getTool } from "@/lib/tools";

const tool = getTool("split-pdf")!;

type SplitMode = "combined" | "separate";

export function SplitTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [pages, setPages] = useState("");
  const [mode, setMode] = useState<SplitMode>("combined");

  useEffect(() => {
    if (pageInfo.status === "ready" && pageInfo.pageCount !== null) {
      setPages(`1-${pageInfo.pageCount}`);
    } else {
      setPages("");
    }
  }, [pageInfo.pageCount, pageInfo.status]);

  const parsed = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const canProcess =
    Boolean(file) &&
    parsed?.ok === true &&
    pageInfo.status === "ready" &&
    !processor.isProcessing;

  function handlePages(next: string) {
    processor.reset();
    setPages(next);
  }

  async function handleSplit() {
    if (!file) {
      processor.fail("Choose a PDF to split.");
      return;
    }
    if (!parsed?.ok) {
      processor.fail(parsed && !parsed.ok ? parsed.error : "Select at least one page.");
      return;
    }

    const selectedPages = parsed.pages;
    const base = sanitizeBaseName(file.name);

    await processor.run(async () => {
      const bytes = await readFileBytes(file);

      if (mode === "combined") {
        const output = await extractPdfPages(bytes, selectedPages);
        return { bytes: output, filename: `${base}-split.pdf` };
      }

      const pageFiles = await splitPdfIntoPages(bytes, selectedPages);
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      for (const page of pageFiles) {
        zip.file(`${base}-page-${page.page}.pdf`, page.bytes);
      }
      const zipBytes = await zip.generateAsync({ type: "uint8array" });
      return {
        bytes: zipBytes,
        filename: `${base}-split.zip`,
        mimeType: "application/zip",
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
        title="Drop one PDF here"
        hint="Choose the document you want to split. Its page count is read locally."
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

      <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-[1fr_1.3fr]">
        <OptionField
          label="Output"
          htmlFor="split-mode"
          hint={
            mode === "combined"
              ? "Selected pages become one PDF."
              : "Every selected page becomes its own PDF, downloaded as a ZIP."
          }
        >
          <select
            id="split-mode"
            value={mode}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setMode(event.target.value as SplitMode);
            }}
            className={selectClasses}
          >
            <option value="combined">One PDF with selected pages</option>
            <option value="separate">One PDF per page (ZIP)</option>
          </select>
        </OptionField>

        <PageRangeField
          value={pages}
          onChange={handlePages}
          pageCount={pageInfo.pageCount}
          label="Pages to extract"
          disabled={processor.isProcessing}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {parsed?.ok
            ? `${parsed.pages.length} page${parsed.pages.length === 1 ? "" : "s"} selected.`
            : "Enter a valid selection to continue."}
        </p>
        <ProcessButton
          onClick={handleSplit}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label={mode === "combined" ? "Split PDF" : "Create ZIP"}
          processingLabel="Extracting pages…"
          icon={<Scissors className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Extracting selected pages"
        />
      </div>
    </ToolShell>
  );
}
