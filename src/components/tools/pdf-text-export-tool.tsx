"use client";

import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
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
import { PageRangeField } from "@/components/tools/page-range-field";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import { readFileBytes } from "@/lib/pdf/client";
import { pdfToDocx } from "@/lib/pdf/pdf-to-docx";
import { pdfToXlsx } from "@/lib/pdf/pdf-to-xlsx";
import { parsePageRanges } from "@/lib/pdf/ranges";
import { textPagesToPlainText } from "@/lib/pdf/text-layout";
import { extractPdfText } from "@/lib/pdf/text-extract";
import { DOCX_MIME_TYPE } from "@/lib/office/docx-writer";
import { XLSX_MIME_TYPE } from "@/lib/office/xlsx-writer";
import { getTool } from "@/lib/tools";

type TextExportMode = "text" | "word" | "excel";

const MODE_LABELS: Record<
  TextExportMode,
  { verb: string; success: string; processing: string }
> = {
  text: {
    verb: "Extract text",
    success: "Your text file is ready",
    processing: "Extracting text",
  },
  word: {
    verb: "Create DOCX",
    success: "Your Word document is ready",
    processing: "Building your DOCX",
  },
  excel: {
    verb: "Create XLSX",
    success: "Your spreadsheet is ready",
    processing: "Building your XLSX",
  },
};

function PdfTextExportTool({ mode }: { mode: TextExportMode }) {
  const slug =
    mode === "word" ? "pdf-to-word" : mode === "excel" ? "pdf-to-excel" : "pdf-to-text";
  const tool = getTool(slug)!;
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [target, setTarget] = useState<"all" | "selected">("all");
  const [pages, setPages] = useState("");

  const range = useMemo(() => {
    if (pageInfo.pageCount === null) return null;
    return parsePageRanges(pages, pageInfo.pageCount);
  }, [pageInfo.pageCount, pages]);

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    (target === "all" || range?.ok === true) &&
    !processor.isProcessing;

  async function handleExport() {
    if (!file) {
      processor.fail("Choose a PDF first.");
      return;
    }
    if (target === "selected" && !range?.ok) {
      processor.fail(range && !range.ok ? range.error : "Select pages to export.");
      return;
    }

    const selectedPages =
      target === "selected" && range?.ok ? range.pages : undefined;
    const base = sanitizeBaseName(file.name);

    await processor.run(async () => {
      const bytes = await readFileBytes(file);

      if (mode === "word") {
        return {
          bytes: await pdfToDocx(bytes, selectedPages),
          filename: `${base}.docx`,
          mimeType: DOCX_MIME_TYPE,
        };
      }

      if (mode === "excel") {
        return {
          bytes: await pdfToXlsx(bytes, selectedPages),
          filename: `${base}.xlsx`,
          mimeType: XLSX_MIME_TYPE,
        };
      }

      const textPages = await extractPdfText(bytes, selectedPages);
      return {
        bytes: new TextEncoder().encode(textPagesToPlainText(textPages)),
        filename: `${base}.txt`,
        mimeType: "text/plain",
      };
    });
  }

  function reset() {
    processor.reset();
    queue.clear();
    setPages("");
    setTarget("all");
  }

  const labels = MODE_LABELS[mode];

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
        hint="Only selectable text is read. Scanned pages need OCR, which is not included."
      />
      <FileQueueError message={queue.error} />

      <SelectedFiles
        files={queue.files}
        onRemove={(index) => {
          processor.reset();
          queue.remove(index);
          setPages("");
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
        <OptionField label="Apply to" htmlFor={`${slug}-target`}>
          <select
            id={`${slug}-target`}
            value={target}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setTarget(event.target.value as "all" | "selected");
            }}
            className={selectClasses}
          >
            <option value="all">All pages</option>
            <option value="selected">Selected pages</option>
          </select>
        </OptionField>

        {target === "selected" ? (
          <PageRangeField
            value={pages}
            onChange={(next) => {
              processor.reset();
              setPages(next);
            }}
            pageCount={pageInfo.pageCount}
            label="Pages to read"
            disabled={processor.isProcessing}
          />
        ) : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {mode === "excel"
            ? "Rows and columns are inferred from where text appears on each page."
            : mode === "word"
              ? "Each extracted line becomes a paragraph in the DOCX."
              : "Page breaks are marked with a page header in the TXT."}
        </p>
        <ProcessButton
          onClick={handleExport}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label={labels.verb}
          processingLabel={`${labels.processing}…`}
          icon={<FileText className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={reset}
          processingLabel={labels.processing}
          successLabel={labels.success}
        />
      </div>
    </ToolShell>
  );
}

export function PdfToTextTool() {
  return <PdfTextExportTool mode="text" />;
}

export function PdfToWordTool() {
  return <PdfTextExportTool mode="word" />;
}

export function PdfToExcelTool() {
  return <PdfTextExportTool mode="excel" />;
}
