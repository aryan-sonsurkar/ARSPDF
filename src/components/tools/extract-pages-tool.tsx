"use client";

import { useMemo, useState } from "react";
import { FileOutput } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  DocumentInfo,
  FileQueueError,
  ProcessButton,
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
import { extractPdfPages } from "@/lib/pdf/split";
import { getTool } from "@/lib/tools";

const tool = getTool("extract-pages")!;

export function ExtractPagesTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [pages, setPages] = useState("");

  const parsed = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const canProcess =
    Boolean(file) &&
    parsed?.ok === true &&
    pageInfo.status === "ready" &&
    !processor.isProcessing;

  async function handleExtract() {
    if (!file) {
      processor.fail("Choose a PDF first.");
      return;
    }
    if (!parsed?.ok) {
      processor.fail(parsed && !parsed.ok ? parsed.error : "Select pages to extract.");
      return;
    }

    const selected = parsed.pages;

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await extractPdfPages(bytes, selected);
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-extracted.pdf`,
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
        hint="Choose the document you want to pull pages from. Only the pages you list are copied."
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

      <div className="mt-6 border-t border-border/70 pt-5">
        <PageRangeField
          value={pages}
          onChange={(next) => {
            processor.reset();
            setPages(next);
          }}
          pageCount={pageInfo.pageCount}
          label="Pages to extract"
          hint="The selected pages become a new PDF in the order you list them."
          disabled={processor.isProcessing}
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {parsed?.ok
            ? `${parsed.pages.length} page${parsed.pages.length === 1 ? "" : "s"} will be copied into the new PDF.`
            : "Select at least one page to extract."}
        </p>
        <ProcessButton
          onClick={handleExtract}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Extract pages"
          processingLabel="Extracting pages…"
          icon={<FileOutput className="h-4 w-4" aria-hidden="true" />}
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
