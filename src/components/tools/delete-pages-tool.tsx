"use client";

import { useMemo, useState } from "react";
import { FileMinus } from "lucide-react";
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
import { deletePdfPages } from "@/lib/pdf/delete-pages";
import { getTool } from "@/lib/tools";

const tool = getTool("delete-pages")!;

export function DeletePagesTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [pages, setPages] = useState("");

  const parsed = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const remaining =
    pageInfo.pageCount !== null && parsed?.ok
      ? pageInfo.pageCount - parsed.pages.length
      : null;

  const canProcess =
    Boolean(file) &&
    parsed?.ok === true &&
    (remaining ?? 0) > 0 &&
    pageInfo.status === "ready" &&
    !processor.isProcessing;

  async function handleDelete() {
    if (!file) {
      processor.fail("Choose a PDF first.");
      return;
    }
    if (!parsed?.ok) {
      processor.fail(parsed && !parsed.ok ? parsed.error : "Select pages to delete.");
      return;
    }
    if (remaining !== null && remaining < 1) {
      processor.fail(
        "You selected every page. Keep at least one page to create a valid PDF.",
      );
      return;
    }

    const toDelete = parsed.pages;

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await deletePdfPages(bytes, toDelete);
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-pages-removed.pdf`,
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
        hint="Choose the document you want to trim. The remaining pages keep their original order."
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
          label="Pages to delete"
          hint="List every page you want removed, for example 2,5-7."
          disabled={processor.isProcessing}
        />

        {remaining !== null ? (
          <p
            className={
              remaining < 1
                ? "mt-2 text-[11px] font-medium text-[hsl(0_90%_72%)]"
                : "mt-2 text-[11px] text-muted-foreground"
            }
          >
            {remaining < 1
              ? "This would remove every page. Deselect at least one page."
              : `${remaining} page${remaining === 1 ? "" : "s"} will remain in the new PDF.`}
          </p>
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {parsed?.ok
            ? `${parsed.pages.length} page${parsed.pages.length === 1 ? "" : "s"} selected for removal.`
            : "Select at least one page to remove."}
        </p>
        <ProcessButton
          onClick={handleDelete}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Delete pages"
          processingLabel="Removing pages…"
          icon={<FileMinus className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Removing selected pages"
        />
      </div>
    </ToolShell>
  );
}
