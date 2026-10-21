"use client";

import { PDFDocument } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";
import { renderPdfPages } from "./render";

export type CompressMode = "lossless" | "balanced" | "strong";

export type CompressOptions = {
  mode: CompressMode;
};

const RASTER_SETTINGS: Record<
  Exclude<CompressMode, "lossless">,
  { scale: number; quality: number }
> = {
  balanced: { scale: 1.5, quality: 0.72 },
  strong: { scale: 1, quality: 0.5 },
};

export async function compressPdf(
  input: BinaryInput,
  options: CompressOptions,
): Promise<Uint8Array> {
  if (options.mode === "lossless") {
    const document = await loadPdf(input);
    return savePdf(document);
  }

  const settings = RASTER_SETTINGS[options.mode];
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const pages = await renderPdfPages(bytes, {
    format: "jpeg",
    scale: settings.scale,
    quality: settings.quality,
  });

  if (pages.length === 0) {
    throw new PdfToolError("This PDF does not contain any pages.");
  }

  const output = await PDFDocument.create();
  output.setTitle("Compressed PDF");

  for (const page of pages) {
    const embedded = await output.embedJpg(page.bytes);
    const added = output.addPage([page.pageWidth, page.pageHeight]);
    added.drawImage(embedded, {
      x: 0,
      y: 0,
      width: page.pageWidth,
      height: page.pageHeight,
    });
  }

  return savePdf(output);
}
