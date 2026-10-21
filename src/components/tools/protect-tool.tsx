"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
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
import { protectPdf } from "@/lib/pdf/protect";
import { getTool } from "@/lib/tools";

const tool = getTool("protect-pdf")!;

export function ProtectTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const passwordValid = password.length >= 4 && password.length <= 128;
  const matches = password === confirmation;

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    passwordValid &&
    matches &&
    !processor.isProcessing;

  async function handleProtect() {
    if (!file) {
      processor.fail("Choose a PDF to protect.");
      return;
    }
    if (!passwordValid) {
      processor.fail("Use a password between 4 and 128 characters.");
      return;
    }
    if (!matches) {
      processor.fail("The password and confirmation do not match.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await protectPdf(bytes, { userPassword: password });
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-protected.pdf`,
      };
    });
  }

  function reset() {
    processor.reset();
    queue.clear();
    setPassword("");
    setConfirmation("");
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
        hint="The document is encrypted with AES-256 in this browser tab."
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

      <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-2">
        <OptionField
          label="Password"
          htmlFor="protect-password"
          hint="4 to 128 characters. Store it somewhere safe."
        >
          <input
            id="protect-password"
            type="password"
            value={password}
            autoComplete="new-password"
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setPassword(event.target.value);
            }}
            className={inputClasses}
          />
        </OptionField>

        <OptionField
          label="Confirm password"
          htmlFor="protect-confirmation"
          hint="Enter the same password again."
        >
          <input
            id="protect-confirmation"
            type="password"
            value={confirmation}
            autoComplete="new-password"
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setConfirmation(event.target.value);
            }}
            className={inputClasses}
          />
        </OptionField>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {password.length === 0
            ? "Set a password before protecting the document."
            : passwordValid && matches
              ? "The password cannot be recovered after download."
              : "Fix the password fields to continue."}
        </p>
        <ProcessButton
          onClick={handleProtect}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Protect PDF"
          processingLabel="Encrypting document…"
          icon={<Lock className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={reset}
          processingLabel="Encrypting your document"
          successLabel="Your protected PDF is ready"
        />
      </div>
    </ToolShell>
  );
}
