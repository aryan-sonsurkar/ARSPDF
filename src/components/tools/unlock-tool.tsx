"use client";

import { useState } from "react";
import { Unlock } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  DocumentInfo,
  FileQueueError,
  OptionField,
  ProcessButton,
  inputClasses,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { readFileBytes } from "@/lib/pdf/client";
import { unlockPdf } from "@/lib/pdf/unlock";
import { getTool } from "@/lib/tools";

const tool = getTool("unlock-pdf")!;

export function UnlockTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [password, setPassword] = useState("");

  const canProcess =
    Boolean(file) && !processor.isProcessing && password.length > 0;

  async function handleUnlock() {
    if (!file) {
      processor.fail("Choose a PDF to unlock.");
      return;
    }
    if (password.length === 0) {
      processor.fail("Enter the current password for this PDF.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      return {
        bytes: await unlockPdf(bytes, password),
        filename: `${sanitizeBaseName(file.name)}-unlocked.pdf`,
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
        title="Drop a locked PDF here"
        hint="You must already know the password. Everything stays in this tab."
      />
      <FileQueueError message={queue.error} />

      <SelectedFiles
        files={queue.files}
        onRemove={(index) => {
          processor.reset();
          queue.remove(index);
          setPassword("");
        }}
        disabled={processor.isProcessing}
        label="Locked document"
      />

      {file ? (
        <DocumentInfo
          status={pageInfo.status}
          pageCount={pageInfo.pageCount}
          error={pageInfo.error}
        />
      ) : null}

      <div className="mt-6 border-t border-border/70 pt-5">
        <OptionField
          label="Current password"
          htmlFor="unlock-password"
          hint="The password is used in memory and is never uploaded."
        >
          <input
            id="unlock-password"
            type="password"
            value={password}
            autoComplete="off"
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setPassword(event.target.value);
            }}
            placeholder="Enter the PDF password"
            className={inputClasses}
          />
        </OptionField>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          The unlocked copy is saved without a password.
        </p>
        <ProcessButton
          onClick={handleUnlock}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Unlock PDF"
          processingLabel="Unlocking…"
          icon={<Unlock className="h-4 w-4" aria-hidden="true" />}
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
            setPassword("");
          }}
          processingLabel="Unlocking your document"
          successLabel="Your unlocked PDF is ready"
        />
      </div>
    </ToolShell>
  );
}
