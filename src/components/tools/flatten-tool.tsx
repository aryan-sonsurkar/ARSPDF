"use client";

import { useState } from "react";
import { Layers } from "lucide-react";
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
import { flattenPdf } from "@/lib/pdf/flatten";
import { getTool } from "@/lib/tools";

const tool = getTool("flatten-pdf")!;

export function FlattenTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [forms, setForms] = useState(true);
  const [annotations, setAnnotations] = useState(true);

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    (forms || annotations) &&
    !processor.isProcessing;

  async function handleFlatten() {
    if (!file) {
      processor.fail("Choose a PDF to flatten.");
      return;
    }
    if (!forms && !annotations) {
      processor.fail("Choose at least one flatten option.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      return {
        bytes: await flattenPdf(bytes, { forms, annotations }),
        filename: `${sanitizeBaseName(file.name)}-flattened.pdf`,
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
        hint="Interactive fields and comments become static page content."
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

      <fieldset className="mt-6 grid gap-3 border-t border-border/70 pt-5 sm:grid-cols-2">
        <legend className="sr-only">Flatten options</legend>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-foreground/20 bg-background/40 px-4 py-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={forms}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setForms(event.target.checked);
            }}
            className="h-4 w-4 accent-[hsl(var(--chalk-yellow))]"
          />
          Flatten form fields
        </label>
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-foreground/20 bg-background/40 px-4 py-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={annotations}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setAnnotations(event.target.checked);
            }}
            className="h-4 w-4 accent-[hsl(var(--chalk-yellow))]"
          />
          Remove annotations
        </label>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {forms || annotations
            ? "This change is permanent in the downloaded copy."
            : "Select at least one option."}
        </p>
        <ProcessButton
          onClick={handleFlatten}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Flatten PDF"
          processingLabel="Flattening…"
          icon={<Layers className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Flattening your document"
          successLabel="Your flattened PDF is ready"
        />
      </div>
    </ToolShell>
  );
}
