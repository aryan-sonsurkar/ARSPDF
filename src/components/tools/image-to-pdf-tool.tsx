"use client";

import { useState } from "react";
import { ImagePlus } from "lucide-react";
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
import { validateImageFile } from "@/lib/files/validation";
import {
  imagesToPdf,
  type ImageOrientation,
  type ImagePageSize,
  type ImageSource,
} from "@/lib/pdf/images-to-pdf";
import { getTool } from "@/lib/tools";

const tool = getTool("image-to-pdf")!;

const MARGINS = [
  { value: 0, label: "None" },
  { value: 18, label: "Small (0.25 in)" },
  { value: 36, label: "Medium (0.5 in)" },
  { value: 72, label: "Large (1 in)" },
];

export function ImageToPdfTool() {
  const queue = useFileQueue({ validate: validateImageFile, multiple: true, maxFiles: 20 });
  const processor = useToolProcessor();
  const [pageSize, setPageSize] = useState<ImagePageSize>("a4");
  const [orientation, setOrientation] = useState<ImageOrientation>("auto");
  const [margin, setMargin] = useState(36);

  const canProcess = queue.files.length > 0 && !processor.isProcessing;

  function handleFiles(files: File[]) {
    processor.reset();
    queue.add(files);
  }

  async function handleConvert() {
    if (queue.files.length === 0) {
      processor.fail("Add at least one JPG or PNG image.");
      return;
    }

    const files = [...queue.files];
    await processor.run(async () => {
      const sources: ImageSource[] = [];
      for (const file of files) {
        sources.push({
          name: file.name,
          type: file.type,
          data: new Uint8Array(await file.arrayBuffer()),
        });
      }

      const bytes = await imagesToPdf(sources, { pageSize, orientation, margin });
      return { bytes, filename: "arspdf-images.pdf" };
    });
  }

  return (
    <ToolShell tool={tool}>
      <FileDropzone
        accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
        multiple
        onFiles={handleFiles}
        disabled={processor.isProcessing}
        title="Drop JPG or PNG images here"
        hint="Each image becomes one PDF page. Add up to 20 images and reorder them before converting."
      />
      <FileQueueError message={queue.error} />

      <SelectedFiles
        files={queue.files}
        onRemove={(index) => {
          processor.reset();
          queue.remove(index);
        }}
        onMove={(from, to) => {
          processor.reset();
          queue.move(from, to);
        }}
        allowReorder
        disabled={processor.isProcessing}
        label="Page order"
      />

      <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 sm:grid-cols-3">
        <OptionField
          label="Page size"
          htmlFor="image-page-size"
          hint={pageSize === "fit" ? "Each page matches the image size plus margins." : "Images are scaled to fit inside the page."}
        >
          <select
            id="image-page-size"
            value={pageSize}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setPageSize(event.target.value as ImagePageSize);
            }}
            className={selectClasses}
          >
            <option value="a4">A4</option>
            <option value="letter">US Letter</option>
            <option value="fit">Fit to image</option>
          </select>
        </OptionField>

        <OptionField
          label="Orientation"
          htmlFor="image-orientation"
          hint={pageSize === "fit" ? "Orientation follows the image." : "Auto uses each image's aspect ratio."}
        >
          <select
            id="image-orientation"
            value={orientation}
            disabled={processor.isProcessing || pageSize === "fit"}
            onChange={(event) => {
              processor.reset();
              setOrientation(event.target.value as ImageOrientation);
            }}
            className={selectClasses}
          >
            <option value="auto">Auto</option>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
          </select>
        </OptionField>

        <OptionField label="Margin" htmlFor="image-margin">
          <select
            id="image-margin"
            value={margin}
            disabled={processor.isProcessing}
            onChange={(event) => {
              processor.reset();
              setMargin(Number(event.target.value));
            }}
            className={selectClasses}
          >
            {MARGINS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </OptionField>
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
        Aspect ratios are preserved. Transparent PNG areas remain transparent in the
        PDF; most viewers display them against white.
      </p>

      <div className="mt-6 flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {queue.files.length === 0
            ? "Add at least one image."
            : `${queue.files.length} image${queue.files.length === 1 ? "" : "s"} → ${queue.files.length} PDF page${queue.files.length === 1 ? "" : "s"}.`}
        </p>
        <ProcessButton
          onClick={handleConvert}
          disabled={!canProcess}
          isProcessing={processor.isProcessing}
          label="Create PDF"
          processingLabel="Building PDF…"
          icon={<ImagePlus className="h-4 w-4" aria-hidden="true" />}
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
          processingLabel="Building your PDF"
        />
      </div>
    </ToolShell>
  );
}
