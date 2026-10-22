"use client";

import { extractPdfText } from "./text-extract";
import { textPagesToMarkdown } from "./text-layout";

export async function pdfToMarkdown(
  input: Uint8Array | ArrayBuffer,
  pages?: number[],
): Promise<string> {
  const textPages = await extractPdfText(input, pages);
  return textPagesToMarkdown(textPages);
}
