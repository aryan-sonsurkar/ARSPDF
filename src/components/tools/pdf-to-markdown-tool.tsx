"use client";

import { FileCode2 } from "lucide-react";
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
import { readFileBytes } from "@/lib/pdf/client";
import { pdfToMarkdown } from "@/lib/pdf/pdf-to-markdown";
import { getTool } from "@/lib/tools";

const tool = getTool("pdf-to-markdown")!;

export function PdfToMarkdownTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();

  async function handleExport() {
    if (!file) {
      processor.fail("Choose a PDF first.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const markdown = await pdfToMarkdown(bytes);

      return {
        bytes: new TextEncoder().encode(markdown),
        filename: `${sanitizeBaseName(file.name)}.md`,
        mimeType: "text/markdown",
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
        hint="Only selectable text is read. Each PDF page becomes a Markdown section."
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

      {file ? (
        <DocumentInfo
          status={pageInfo.status}
          pageCount={pageInfo.pageCount}
          error={pageInfo.error}
        />
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Output uses one heading per page plus extracted text blocks.
        </p>
        <ProcessButton
          onClick={handleExport}
          disabled={!file || pageInfo.status !== "ready" || processor.isProcessing}
          isProcessing={processor.isProcessing}
          label="Create Markdown"
          processingLabel="Extracting text…"
          icon={<FileCode2 className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Building your Markdown file"
          successLabel="Your Markdown file is ready"
        />
      </div>
    </ToolShell>
  );
}
