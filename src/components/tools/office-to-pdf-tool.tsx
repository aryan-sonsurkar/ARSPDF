"use client";

import { useState } from "react";
import { FileOutput } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  FileQueueError,
  OptionField,
  ProcessButton,
  selectClasses,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { sanitizeBaseName } from "@/lib/files/format";
import {
  validateDocxFile,
  validatePptxFile,
  validateXlsxFile,
} from "@/lib/files/validation";
import { readFileBytes } from "@/lib/pdf/client";
import { docxToPdf } from "@/lib/office/docx-to-pdf";
import type {
  ConvertOrientation,
  ConvertPageSize,
} from "@/lib/office/html-to-pdf";
import { pptxToPdf } from "@/lib/office/pptx-to-pdf";
import { xlsxToPdf } from "@/lib/office/xlsx-to-pdf";
import { getTool } from "@/lib/tools";

type OfficeKind = "word" | "excel" | "powerpoint";

const KIND_CONFIG: Record<
  OfficeKind,
  {
    slug: string;
    accept: string;
    title: string;
    hint: string;
    validate: (file: File) => string | null;
    supportsPageSetup: boolean;
    defaultOrientation: ConvertOrientation;
  }
> = {
  word: {
    slug: "word-to-pdf",
    accept:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx",
    title: "Drop a DOCX file here",
    hint: "Text, headings, lists, tables, and embedded images are converted.",
    validate: validateDocxFile,
    supportsPageSetup: true,
    defaultOrientation: "portrait",
  },
  excel: {
    slug: "excel-to-pdf",
    accept:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx",
    title: "Drop an XLSX file here",
    hint: "Each sheet is rendered as a table across as many pages as it needs.",
    validate: validateXlsxFile,
    supportsPageSetup: true,
    defaultOrientation: "landscape",
  },
  powerpoint: {
    slug: "powerpoint-to-pdf",
    accept:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation,.pptx",
    title: "Drop a PPTX file here",
    hint: "Slide text becomes a printable, text-focused PDF deck.",
    validate: validatePptxFile,
    supportsPageSetup: false,
    defaultOrientation: "landscape",
  },
};

function OfficeToPdfTool({ kind }: { kind: OfficeKind }) {
  const config = KIND_CONFIG[kind];
  const tool = getTool(config.slug)!;
  const queue = useFileQueue({ validate: config.validate, multiple: false });
  const file = queue.files[0] ?? null;
  const processor = useToolProcessor();
  const [pageSize, setPageSize] = useState<ConvertPageSize>("a4");
  const [orientation, setOrientation] = useState<ConvertOrientation>(
    config.defaultOrientation,
  );

  async function handleConvert() {
    if (!file) {
      processor.fail("Choose a file to convert.");
      return;
    }

    const base = sanitizeBaseName(file.name);

    await processor.run(async () => {
      const bytes = await readFileBytes(file);

      if (kind === "word") {
        return {
          bytes: await docxToPdf(bytes, { pageSize, orientation }),
          filename: `${base}-converted.pdf`,
        };
      }

      if (kind === "excel") {
        return {
          bytes: await xlsxToPdf(bytes, { pageSize, orientation }),
          filename: `${base}-converted.pdf`,
        };
      }

      return {
        bytes: await pptxToPdf(bytes),
        filename: `${base}-converted.pdf`,
      };
    });
  }

  return (
    <ToolShell tool={tool}>
      <FileDropzone
        accept={config.accept}
        multiple={false}
        onFiles={(files) => {
          processor.reset();
          queue.add(files);
        }}
        disabled={processor.isProcessing}
        title={config.title}
        hint={config.hint}
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

      {config.supportsPageSetup ? (
        <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-2">
          <OptionField label="Page size" htmlFor={`${config.slug}-page-size`}>
            <select
              id={`${config.slug}-page-size`}
              value={pageSize}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setPageSize(event.target.value as ConvertPageSize);
              }}
              className={selectClasses}
            >
              <option value="a4">A4</option>
              <option value="letter">US Letter</option>
            </select>
          </OptionField>

          <OptionField label="Orientation" htmlFor={`${config.slug}-orientation`}>
            <select
              id={`${config.slug}-orientation`}
              value={orientation}
              disabled={processor.isProcessing}
              onChange={(event) => {
                processor.reset();
                setOrientation(event.target.value as ConvertOrientation);
              }}
              className={selectClasses}
            >
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </OptionField>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {kind === "powerpoint"
            ? "Each slide starts on its own landscape A4 page."
            : "Conversion happens entirely in this browser tab."}
        </p>
        <ProcessButton
          onClick={handleConvert}
          disabled={!file || processor.isProcessing}
          isProcessing={processor.isProcessing}
          label="Convert to PDF"
          processingLabel="Converting document…"
          icon={<FileOutput className="h-4 w-4" aria-hidden="true" />}
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

export function WordToPdfTool() {
  return <OfficeToPdfTool kind="word" />;
}

export function ExcelToPdfTool() {
  return <OfficeToPdfTool kind="excel" />;
}

export function PowerPointToPdfTool() {
  return <OfficeToPdfTool kind="powerpoint" />;
}
