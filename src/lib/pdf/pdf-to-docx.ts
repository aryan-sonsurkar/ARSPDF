"use client";

import { createTextDocx } from "@/lib/office/docx-writer";
import { extractPdfText } from "./text-extract";

export async function pdfToDocx(
  input: Uint8Array,
  pages?: number[],
): Promise<Uint8Array> {
  const textPages = await extractPdfText(input, pages);

  return createTextDocx(
    textPages.map((page) => ({
      lines: page.lines.map((line) => line.text),
    })),
  );
}
