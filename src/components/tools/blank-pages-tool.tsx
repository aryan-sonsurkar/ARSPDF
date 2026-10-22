"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { SelectedFiles } from "@/components/upload/selected-files";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  DocumentInfo,
  FileQueueError,
  OptionField,
  ProcessButton,
  inputClasses,
  selectClasses,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useFileQueue } from "@/hooks/use-file-queue";
import { usePdfPageCount } from "@/hooks/use-pdf-page-count";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { validatePdfFile } from "@/lib/files/validation";
import { sanitizeBaseName } from "@/lib/files/format";
import {
  addBlankPages,
  type BlankPagePosition,
  type BlankPageSize,
} from "@/lib/pdf/blank-pages";
import { readFileBytes } from "@/lib/pdf/client";
import { getTool } from "@/lib/tools";

const tool = getTool("add-blank-pages")!;

export function BlankPagesTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [count, setCount] = useState("1");
  const [position, setPosition] = useState<BlankPagePosition>("end");
  const [size, setSize] = useState<BlankPageSize>("match-first");

  const parsedCount = Number(count);
  const countValid =
    Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= 50;

  const canProcess =
    Boolean(file) &&
    pageInfo.status === "ready" &&
    countValid &&
    !processor.isProcessing;

  async function handleAdd() {
    if (!file) {
      processor.fail("Choose a PDF first.");
      return;
    }
    if (!countValid) {
      processor.fail("Choose between 1 and 50 blank pages.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      return {
        bytes: await addBlankPages(bytes, { count: parsedCount, position, size }),
        filename: `${sanitizeBaseName(file.name)}-with-blanks.pdf`,
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
        hint="Blank pages are inserted without touching the existing page content."
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

      <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-3">
        <OptionField label="Blank pages" htmlFor="blank-count" hint="1 to 50.">
          <input
            id="blank-count"
            type="number"
            min={1}
            max={50}
            step={1}
            value={count}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setCount(event.target.value);
            }}
            className={inputClasses}
          />
        </OptionField>

        <OptionField label="Position" htmlFor="blank-position">
          <select
            id="blank-position"
            value={position}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setPosition(event.target.value as BlankPagePosition);
            }}
            className={selectClasses}
          >
            <option value="end">At the end</option>
            <option value="start">At the start</option>
          </select>
        </OptionField>

        <OptionField label="Page size" htmlFor="blank-size">
          <select
            id="blank-size"
            value={size}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setSize(event.target.value as BlankPageSize);
            }}
            className={selectClasses}
          >
            <option value="match-first">Match first page</option>
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </OptionField>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {countValid
            ? `${parsedCount} blank page${parsedCount === 1 ? "" : "s"} will be added at the ${position}.`
            : "Enter a number between 1 and 50."}
        </p>
        <ProcessButton
          onClick={handleAdd}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Add blank pages"
          processingLabel="Adding blank pages…"
          icon={<FilePlus2 className="h-4 w-4" aria-hidden="true" />}
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
            setCount("1");
          }}
          processingLabel="Adding blank pages"
        />
      </div>
    </ToolShell>
  );
}
