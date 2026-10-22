"use client";

import { ArrowDownUp } from "lucide-react";
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
import { reversePdf } from "@/lib/pdf/reverse";
import { getTool } from "@/lib/tools";

const tool = getTool("reverse-pdf")!;

export function ReverseTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();

  async function handleReverse() {
    if (!file) {
      processor.fail("Choose a PDF to reverse.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      return {
        bytes: await reversePdf(bytes),
        filename: `${sanitizeBaseName(file.name)}-reversed.pdf`,
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
        hint="Every page is copied into a new document in reverse order."
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
          The last page becomes page one, and the first page moves to the end.
        </p>
        <ProcessButton
          onClick={handleReverse}
          disabled={!file || pageInfo.status !== "ready" || processor.isProcessing}
          isProcessing={processor.isProcessing}
          label="Reverse PDF"
          processingLabel="Reversing pages…"
          icon={<ArrowDownUp className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Reversing your document"
        />
      </div>
    </ToolShell>
  );
}
