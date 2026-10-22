"use client";

import { Contrast } from "lucide-react";
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
import { grayscalePdf } from "@/lib/pdf/grayscale";
import { getTool } from "@/lib/tools";

const tool = getTool("grayscale-pdf")!;

export function GrayscaleTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();

  async function handleConvert() {
    if (!file) {
      processor.fail("Choose a PDF to convert.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      return {
        bytes: await grayscalePdf(bytes),
        filename: `${sanitizeBaseName(file.name)}-grayscale.pdf`,
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
        hint="Pages are re-rendered in grayscale, which is handy for printing."
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
          Rasterizing removes color but also makes text non-selectable.
        </p>
        <ProcessButton
          onClick={handleConvert}
          disabled={!file || pageInfo.status !== "ready" || processor.isProcessing}
          isProcessing={processor.isProcessing}
          label="Convert to grayscale"
          processingLabel="Converting to grayscale…"
          icon={<Contrast className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Converting your document"
        />
      </div>
    </ToolShell>
  );
}
