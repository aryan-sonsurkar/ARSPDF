"use client";

import { useMemo, useState } from "react";
import { List } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  OptionField,
  ProcessButton,
  selectClasses,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { parseCsv } from "@/lib/csv";
import { sanitizeBaseName } from "@/lib/files/format";
import {
  csvToPdf,
  type CsvToPdfOrientation,
  type CsvToPdfPageSize,
} from "@/lib/pdf/csv-to-pdf";
import { getTool } from "@/lib/tools";

const tool = getTool("csv-to-pdf")!;

export function CsvToPdfTool() {
  const processor = useToolProcessor();
  const [csvText, setCsvText] = useState("");
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [headerRow, setHeaderRow] = useState(true);
  const [pageSize, setPageSize] = useState<CsvToPdfPageSize>("a4");
  const [orientation, setOrientation] = useState<CsvToPdfOrientation>("portrait");

  const rows = useMemo(() => parseCsv(csvText), [csvText]);
  const columnCount = useMemo(
    () => (rows.length === 0 ? 0 : Math.max(...rows.map((row) => row.length))),
    [rows],
  );

  const canProcess = rows.length > 0 && !processor.isProcessing;

  async function handleCreate() {
    if (rows.length === 0) {
      processor.fail("Load a CSV file with at least one row.");
      return;
    }

    await processor.run(async () => {
      const output = await csvToPdf(csvText, {
        headerRow,
        pageSize,
        orientation,
      });

      return {
        bytes: output,
        filename: sourceName
          ? `${sanitizeBaseName(sourceName)}-table.pdf`
          : "csv-table.pdf",
      };
    });
  }

  return (
    <ToolShell tool={tool}>
      <FileDropzone
        accept=".csv,text/csv"
        multiple={false}
        compact
        onFiles={async (files) => {
          const chosen = files[0];
          if (!chosen) return;
          processor.reset();
          setCsvText(await chosen.text());
          setSourceName(chosen.name);
        }}
        disabled={processor.isProcessing}
        title="Drop a .csv file here"
        hint="Commas, quoted fields, and line breaks inside quotes are supported."
      />

      {sourceName ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Loaded <span className="font-semibold text-foreground">{sourceName}</span>
          {rows.length > 0
            ? ` · ${rows.length.toLocaleString()} row${rows.length === 1 ? "" : "s"} · ${columnCount} column${columnCount === 1 ? "" : "s"}`
            : ""}
          .
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-2">
        <OptionField label="Page size" htmlFor="csv-page-size">
          <select
            id="csv-page-size"
            value={pageSize}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setPageSize(event.target.value as CsvToPdfPageSize);
            }}
            className={selectClasses}
          >
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </OptionField>

        <OptionField label="Orientation" htmlFor="csv-orientation">
          <select
            id="csv-orientation"
            value={orientation}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setOrientation(event.target.value as CsvToPdfOrientation);
            }}
            className={selectClasses}
          >
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </OptionField>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-foreground/20 bg-background/40 px-4 py-3 text-sm font-semibold sm:col-span-2">
          <input
            type="checkbox"
            checked={headerRow}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setHeaderRow(event.target.checked);
            }}
            className="h-4 w-4 accent-[hsl(var(--chalk-yellow))]"
          />
          Treat the first row as a header
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {rows.length > 0
            ? `${rows.length.toLocaleString()} row${rows.length === 1 ? "" : "s"} across ${columnCount} column${columnCount === 1 ? "" : "s"}.`
            : "Load a CSV file to preview its dimensions."}
        </p>
        <ProcessButton
          onClick={handleCreate}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Create PDF"
          processingLabel="Building your table…"
          icon={<List className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={() => {
            processor.reset();
            setCsvText("");
            setSourceName(null);
            setHeaderRow(true);
            setPageSize("a4");
            setOrientation("portrait");
          }}
          processingLabel="Rendering your CSV as a table"
        />
      </div>
    </ToolShell>
  );
}
