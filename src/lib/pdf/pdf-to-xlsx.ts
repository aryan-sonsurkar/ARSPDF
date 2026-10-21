"use client";

import { writeXlsx } from "@/lib/office/xlsx-writer";
import { extractPdfText } from "./text-extract";

export async function pdfToXlsx(
  input: Uint8Array,
  pages?: number[],
): Promise<Uint8Array> {
  const textPages = await extractPdfText(input, pages);

  const sheets = textPages.map((page) => ({
    name: `Page ${page.pageNumber}`,
    rows: page.lines.map((line) =>
      line.cells.length > 0 ? line.cells : [line.text],
    ),
  }));

  return writeXlsx(sheets);
}
