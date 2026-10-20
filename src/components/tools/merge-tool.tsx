"use client";

import { Files } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  DocumentInfo,
  FileQueueError,
  ProcessButton,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { mergePdfs } from "@/lib/pdf/merge";
import { getTool } from "@/lib/tools";
import type { PdfSource } from "@/types/pdf";

const tool = getTool("merge-pdf")!;

export function MergeTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: true, maxFiles: 20 });
  const processor = useToolProcessor();
  const firstFile = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(firstFile);
  const canMerge = queue.files.length >= 2 && !processor.isProcessing;

  function handleFiles(files: File[]) {
    processor.reset();
    queue.add(files);
  }

  async function handleMerge() {
    if (queue.files.length < 2) {
      processor.fail("Add at least two PDF files to merge.");
      return;
    }

    const files = [...queue.files];
    await processor.run(async () => {
      const sources: PdfSource[] = [];
      for (const file of files) {
        sources.push({ name: file.name, data: new Uint8Array(await file.arrayBuffer()) });
      }
      const bytes = await mergePdfs(sources);
      return {
        bytes,
        filename: `${sanitizeBaseName(files[0]?.name ?? "document")}-merged.pdf`,
      };
    });
  }

  return (
    <ToolShell tool={tool}>
      <FileDropzone
        accept="application/pdf,.pdf"
        multiple
        onFiles={handleFiles}
        disabled={processor.isProcessing}
        title="Drop PDF files here"
        hint="Add two or more PDFs. You can reorder them after adding. Files stay in this browser."
      />
      <FileQueueError message={queue.error} />

      <SelectedFiles
        files={queue.files}
        onRemove={(index) => {
          processor.reset();
          queue.remove(index);
        }}
        onMove={(from, to) => {
          processor.reset();
          queue.move(from, to);
        }}
        allowReorder
        disabled={processor.isProcessing}
        label="Merge order"
      />

      {firstFile && pageInfo.status === "ready" ? (
        <p className="mt-3 text-xs text-muted-foreground">
          First document: {pageInfo.pageCount} page
          {pageInfo.pageCount === 1 ? "" : "s"}. Page order inside each file is
          preserved.
        </p>
      ) : (
        <DocumentInfo
          status={pageInfo.status}
          pageCount={pageInfo.pageCount}
          error={pageInfo.error}
        />
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {queue.files.length < 2
            ? "At least two PDFs are required."
            : `${queue.files.length} files will be combined in the order above.`}
        </p>
        <ProcessButton
          onClick={handleMerge}
          disabled={!canMerge}
          isProcessing={processor.isProcessing}
          label="Merge PDFs"
          processingLabel="Merging…"
          icon={<Files className="h-4 w-4" aria-hidden="true" />}
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
          }}
          processingLabel="Merging your PDFs"
        />
      </div>
    </ToolShell>
  );
}
