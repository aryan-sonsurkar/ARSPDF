"use client";

import { Wrench } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  FileQueueError,
  ProcessButton,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { readFileBytes } from "@/lib/pdf/client";
import { repairPdf } from "@/lib/pdf/repair";
import { getTool } from "@/lib/tools";

const tool = getTool("repair-pdf")!;

export function RepairTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const processor = useToolProcessor();

  async function handleRepair() {
    if (!file) {
      processor.fail("Choose a PDF to repair.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const result = await repairPdf(bytes);
      return {
        bytes: result.bytes,
        filename: `${sanitizeBaseName(file.name)}-repaired.pdf`,
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
        title="Drop a damaged PDF here"
        hint="ArsPDF rewrites the file structure, or rebuilds pages if the structure cannot be read."
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

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Repair works best on files that open partially in other readers.
        </p>
        <ProcessButton
          onClick={handleRepair}
          disabled={!file || processor.isProcessing}
          isProcessing={processor.isProcessing}
          label="Repair PDF"
          processingLabel="Repairing document…"
          icon={<Wrench className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Repairing your document"
          successLabel="Your repaired PDF is ready"
        />
      </div>
    </ToolShell>
  );
}
