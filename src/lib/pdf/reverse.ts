import { PDFDocument } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export async function reversePdf(input: BinaryInput): Promise<Uint8Array> {
  const source = await loadPdf(input);
  const pageCount = source.getPageCount();

  if (pageCount < 1) {
    throw new PdfToolError("This PDF does not contain any pages.");
  }

  const output = await PDFDocument.create();
  const indices = Array.from({ length: pageCount }, (_, index) => pageCount - 1 - index);
  const pages = await output.copyPages(source, indices);

  for (const page of pages) {
    output.addPage(page);
  }

  output.setTitle("Reversed pages");

  return savePdf(output);
}
