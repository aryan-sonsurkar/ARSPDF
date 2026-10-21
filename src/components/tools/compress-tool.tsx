"use client";

import { useState } from "react";
import { Minimize2 } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  DocumentInfo,
  FileQueueError,
  OptionField,
  ProcessButton,
  selectClasses,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { readFileBytes } from "@/lib/pdf/client";
import { compressPdf, type CompressMode } from "@/lib/pdf/compress";
import { getTool } from "@/lib/tools";

const tool = getTool("compress-pdf")!;

const MODES: Array<{ value: CompressMode; label: string; hint: string }> = [
  {
    value: "lossless",
    label: "Lossless re-save",
    hint: "Keeps text selectable. Some files shrink very little.",
  },
  {
    value: "balanced",
    label: "Balanced (recommended)",
    hint: "Rasterizes pages at a moderate resolution to reduce size.",
  },
  {
    value: "strong",
    label: "Maximum compression",
    hint: "Lower resolution and quality. Best for image-heavy scans.",
  },
];

export function CompressTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [mode, setMode] = useState<CompressMode>("balanced");

  const canProcess =
    Boolean(file) && pageInfo.status === "ready" && !processor.isProcessing;

  async function handleCompress() {
    if (!file) {
      processor.fail("Choose a PDF to compress.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = await compressPdf(bytes, { mode });
      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-compressed.pdf`,
      };
    });
  }

  const selectedMode = MODES.find((item) => item.value === mode);

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
        hint="Choose how aggressively the file should be reduced."
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

      <div className="mt-6 border-t border-border/70 pt-5">
        <OptionField
          label="Compression mode"
          htmlFor="compress-mode"
          hint={selectedMode?.hint}
        >
          <select
            id="compress-mode"
            value={mode}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setMode(event.target.value as CompressMode);
            }}
            className={selectClasses}
          >
            {MODES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </OptionField>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {mode === "lossless"
            ? "Text stays selectable, but the size may change only slightly."
            : "Rasterized pages lose selectable text and links."}
        </p>
        <ProcessButton
          onClick={handleCompress}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Compress PDF"
          processingLabel="Compressing document…"
          icon={<Minimize2 className="h-4 w-4" aria-hidden="true" />}
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
            setMode("balanced");
          }}
          processingLabel="Compressing your document"
        />
      </div>
    </ToolShell>
  );
}
