import { PDFDocument } from "@cantoo/pdf-lib";
import type { PdfSource } from "@/types/pdf";
import { loadPdf, savePdf } from "./load";
import { PdfToolError } from "./errors";

export async function mergePdfs(sources: PdfSource[]): Promise<Uint8Array> {
  if (sources.length < 2) {
    throw new PdfToolError("Select at least two PDF files to merge.");
  }

  const merged = await PDFDocument.create();
  merged.setTitle("Merged document");

  for (const source of sources) {
    const document = await loadPdf(source.data);
    const pages = await merged.copyPages(document, document.getPageIndices());
    for (const page of pages) {
      merged.addPage(page);
    }
  }

  if (merged.getPageCount() === 0) {
    throw new PdfToolError("The selected files do not contain any pages to merge.");
  }

  return savePdf(merged);
}
