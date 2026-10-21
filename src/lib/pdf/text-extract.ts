"use client";

import { assertPageList, PdfToolError } from "./errors";
import { openPdfWithPdfJs } from "./pdfjs";
import {
  buildPdfTextPage,
  type PdfTextItem,
  type PdfTextPage,
} from "./text-layout";

export async function extractPdfText(
  input: Uint8Array | ArrayBuffer,
  pages?: number[],
): Promise<PdfTextPage[]> {
  const document = await openPdfWithPdfJs(input);

  try {
    const selected =
      pages ?? Array.from({ length: document.numPages }, (_, index) => index + 1);
    assertPageList(selected, document.numPages);

    const output: PdfTextPage[] = [];

    for (const pageNumber of selected) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const items: PdfTextItem[] = [];

      for (const item of content.items) {
        if (!("str" in item) || item.str.length === 0) continue;

        const x = item.transform[4];
        const y = item.transform[5];
        if (!Number.isFinite(x) || !Number.isFinite(y)) continue;

        items.push({
          text: item.str,
          x,
          y,
          width: Number.isFinite(item.width) ? item.width : 0,
          height: Number.isFinite(item.height) ? item.height : 10,
        });
      }

      output.push(buildPdfTextPage(pageNumber, items));
      page.cleanup();
    }

    if (output.every((page) => page.text.trim().length === 0)) {
      throw new PdfToolError(
        "No selectable text was found on the chosen pages. Scanned pages need OCR, which ArsPDF does not include.",
      );
    }

    return output;
  } finally {
    await document.destroy();
  }
}
