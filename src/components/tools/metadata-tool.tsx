"use client";

import { useEffect, useState } from "react";
import { Tags } from "lucide-react";
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
import {
  readPdfMetadata,
  writePdfMetadata,
  type PdfMetadata,
} from "@/lib/pdf/metadata";
import { getTool } from "@/lib/tools";

const tool = getTool("edit-metadata")!;

type MetadataFields = {
  title: string;
  author: string;
  subject: string;
  keywords: string;
  creator: string;
  producer: string;
};

const EMPTY_FIELDS: MetadataFields = {
  title: "",
  author: "",
  subject: "",
  keywords: "",
  creator: "",
  producer: "",
};

function toFields(metadata: PdfMetadata): MetadataFields {
  return {
    title: metadata.title,
    author: metadata.author,
    subject: metadata.subject,
    keywords: metadata.keywords.join(", "),
    creator: metadata.creator,
    producer: metadata.producer,
  };
}

export function MetadataTool() {
  const queue = useFileQueue({ validate: validatePdfFile, multiple: false });
  const file = queue.files[0] ?? null;
  const pageInfo = usePdfPageCount(file);
  const processor = useToolProcessor();
  const [fields, setFields] = useState<MetadataFields>(EMPTY_FIELDS);
  const [clear, setClear] = useState(false);

  useEffect(() => {
    if (!file) {
      setFields(EMPTY_FIELDS);
      return;
    }

    let cancelled = false;

    readFileBytes(file)
      .then((bytes) => readPdfMetadata(bytes))
      .then((metadata) => {
        if (!cancelled) setFields(toFields(metadata));
      })
      .catch(() => {
        if (!cancelled) setFields(EMPTY_FIELDS);
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  const disabled = processor.isProcessing || clear;

  const canProcess =
    Boolean(file) && pageInfo.status === "ready" && !processor.isProcessing;

  function updateField(key: keyof MetadataFields, value: string) {
    processor.reset();
    setFields((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (!file) {
      processor.fail("Choose a PDF first.");
      return;
    }

    await processor.run(async () => {
      const bytes = await readFileBytes(file);
      const output = clear
        ? await writePdfMetadata(bytes, { clear: true })
        : await writePdfMetadata(bytes, {
            title: fields.title,
            author: fields.author,
            subject: fields.subject,
            keywords: fields.keywords
              .split(",")
              .map((keyword) => keyword.trim())
              .filter((keyword) => keyword.length > 0),
            creator: fields.creator,
            producer: fields.producer,
          });

      return {
        bytes: output,
        filename: `${sanitizeBaseName(file.name)}-metadata.pdf`,
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
        hint="Existing document properties are read into the fields below."
      />
      <FileQueueError message={queue.error} />

      <SelectedFiles
        files={queue.files}
        onRemove={(index) => {
          processor.reset();
          queue.remove(index);
          setClear(false);
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

      <label className="mt-6 flex cursor-pointer items-center gap-3 border-t border-border/70 pt-5 text-sm font-semibold">
        <input
          type="checkbox"
          checked={clear}
          disabled={processor.isProcessing}
          onChange={(event) => {
            processor.reset();
            setClear(event.target.checked);
          }}
          className="h-4 w-4 accent-[hsl(var(--chalk-yellow))]"
        />
        Remove all metadata
      </label>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <OptionField label="Title" htmlFor="meta-title">
          <input
            id="meta-title"
            type="text"
            value={fields.title}
            disabled={disabled}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Document title"
            className={inputClasses}
          />
        </OptionField>

        <OptionField label="Author" htmlFor="meta-author">
          <input
            id="meta-author"
            type="text"
            value={fields.author}
            disabled={disabled}
            onChange={(event) => updateField("author", event.target.value)}
            placeholder="Author name"
            className={inputClasses}
          />
        </OptionField>

        <OptionField label="Subject" htmlFor="meta-subject">
          <input
            id="meta-subject"
            type="text"
            value={fields.subject}
            disabled={disabled}
            onChange={(event) => updateField("subject", event.target.value)}
            placeholder="Short description"
            className={inputClasses}
          />
        </OptionField>

        <OptionField label="Keywords" htmlFor="meta-keywords" hint="Separate with commas.">
          <input
            id="meta-keywords"
            type="text"
            value={fields.keywords}
            disabled={disabled}
            onChange={(event) => updateField("keywords", event.target.value)}
            placeholder="invoice, finance, 2026"
            className={inputClasses}
          />
        </OptionField>

        <OptionField label="Creator" htmlFor="meta-creator">
          <input
            id="meta-creator"
            type="text"
            value={fields.creator}
            disabled={disabled}
            onChange={(event) => updateField("creator", event.target.value)}
            placeholder="Application that made the file"
            className={inputClasses}
          />
        </OptionField>

        <OptionField label="Producer" htmlFor="meta-producer">
          <input
            id="meta-producer"
            type="text"
            value={fields.producer}
            disabled={disabled}
            onChange={(event) => updateField("producer", event.target.value)}
            placeholder="PDF producer"
            className={inputClasses}
          />
        </OptionField>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {clear
            ? "All document properties will be cleared in the output."
            : "Fields are saved as document properties, not visible page content."}
        </p>
        <ProcessButton
          onClick={handleSave}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Save metadata"
          processingLabel="Saving metadata…"
          icon={<Tags className="h-4 w-4" aria-hidden="true" />}
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
            setClear(false);
          }}
          processingLabel="Updating document properties"
          successLabel="Your updated PDF is ready"
        />
      </div>
    </ToolShell>
  );
}
