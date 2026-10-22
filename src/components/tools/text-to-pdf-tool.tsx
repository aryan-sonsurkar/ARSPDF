"use client";

import { useState } from "react";
import { Type } from "lucide-react";
import { FileDropzone } from "@/components/upload/file-dropzone";
import { TaskFeedback } from "@/components/tools/task-feedback";
import {
  OptionField,
  ProcessButton,
  selectClasses,
} from "@/components/tools/form-controls";
import { ToolShell } from "@/components/tools/tool-shell";
import { useToolProcessor } from "@/hooks/use-tool-processor";
import { sanitizeBaseName } from "@/lib/files/format";
import {
  textToPdf,
  type TextToPdfPageSize,
} from "@/lib/pdf/text-to-pdf";
import { getTool } from "@/lib/tools";

const tool = getTool("text-to-pdf")!;

const FONT_SIZES = [10, 12, 14, 16, 18];

export function TextToPdfTool() {
  const processor = useToolProcessor();
  const [text, setText] = useState("");
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState("12");
  const [pageSize, setPageSize] = useState<TextToPdfPageSize>("a4");

  const canProcess = text.trim().length > 0 && !processor.isProcessing;

  async function handleCreate() {
    if (text.trim().length === 0) {
      processor.fail("Add some text to convert.");
      return;
    }

    await processor.run(async () => {
      const output = await textToPdf(text, {
        fontSize: Number(fontSize),
        pageSize,
      });

      return {
        bytes: output,
        filename: sourceName
          ? `${sanitizeBaseName(sourceName)}.pdf`
          : "text-to-pdf.pdf",
      };
    });
  }

  return (
    <ToolShell tool={tool}>
      <FileDropzone
        accept=".txt,text/plain"
        multiple={false}
        compact
        onFiles={async (files) => {
          const chosen = files[0];
          if (!chosen) return;
          processor.reset();
          setText(await chosen.text());
          setSourceName(chosen.name);
        }}
        disabled={processor.isProcessing}
        title="Drop a .txt file here"
        hint="Or paste text directly below. Only the first file is read."
      />

      {sourceName ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Loaded <span className="font-semibold text-foreground">{sourceName}</span>.
          You can edit the text before converting.
        </p>
      ) : null}

      <div className="mt-5">
        <OptionField label="Text" htmlFor="text-source" hint="Line breaks are preserved.">
          <textarea
            id="text-source"
            value={text}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setText(event.target.value);
            }}
            placeholder="Paste or type the text you want to turn into a PDF…"
            className="min-h-[220px] w-full resize-y rounded-xl border-2 border-dashed border-foreground/25 bg-background/50 p-3 text-base leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-chalk-blue/70 focus:outline-none focus:ring-2 focus:ring-chalk-blue/20 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          />
        </OptionField>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <OptionField label="Font size (pt)" htmlFor="text-font-size">
          <select
            id="text-font-size"
            value={fontSize}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setFontSize(event.target.value);
            }}
            className={selectClasses}
          >
            {FONT_SIZES.map((size) => (
              <option key={size} value={size}>
                {size} pt
              </option>
            ))}
          </select>
        </OptionField>

        <OptionField label="Page size" htmlFor="text-page-size">
          <select
            id="text-page-size"
            value={pageSize}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setPageSize(event.target.value as TextToPdfPageSize);
            }}
            className={selectClasses}
          >
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
          </select>
        </OptionField>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {text.trim().length > 0
            ? `${text.trim().length.toLocaleString()} characters ready to lay out.`
            : "Paste text or load a .txt file to begin."}
        </p>
        <ProcessButton
          onClick={handleCreate}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Create PDF"
          processingLabel="Building your PDF…"
          icon={<Type className="h-4 w-4" aria-hidden="true" />}
        />
      </div>

      <div className="mt-5">
        <TaskFeedback
          status={processor.status}
          error={processor.error}
          result={processor.result}
          onReset={() => {
            processor.reset();
            setText("");
            setSourceName(null);
            setFontSize("12");
            setPageSize("a4");
          }}
          processingLabel="Laying out your text"
        />
      </div>
    </ToolShell>
  );
}
