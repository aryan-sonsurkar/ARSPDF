"use client";

import { PDFDocument } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { PdfToolError } from "./errors";
import { savePdf } from "./load";
import { renderPdfPages } from "./render";

export type GrayscaleOptions = {
  scale?: number;
  quality?: number;
};

export async function grayscalePdf(
  input: BinaryInput,
  options: GrayscaleOptions = {},
): Promise<Uint8Array> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const pages = await renderPdfPages(bytes, {
    format: "jpeg",
    scale: options.scale ?? 1.5,
    quality: options.quality ?? 0.82,
    grayscale: true,
  });

  if (pages.length === 0) {
    throw new PdfToolError("This PDF does not contain any pages.");
  }

  const output = await PDFDocument.create();
  output.setTitle("Grayscale PDF");

  for (const page of pages) {
    const image = await output.embedJpg(page.bytes);
    const added = output.addPage([page.pageWidth, page.pageHeight]);
    added.drawImage(image, {
      x: 0,
      y: 0,
      width: page.pageWidth,
      height: page.pageHeight,
    });
  }

  return savePdf(output);
}
