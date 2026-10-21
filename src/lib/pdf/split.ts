import { PDFDocument } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { assertPageList, PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export async function extractPdfPages(
  input: BinaryInput,
  pages: number[],
): Promise<Uint8Array> {
  const source = await loadPdf(input);
  const pageCount = source.getPageCount();

  assertPageList(pages, pageCount);

  const output = await PDFDocument.create();
  output.setTitle("Extracted pages");
  const copiedPages = await output.copyPages(
    source,
    pages.map((page) => page - 1),
  );

  if (copiedPages.length === 0) {
    throw new PdfToolError("No pages were copied. Select at least one page.");
  }

  for (const page of copiedPages) {
    output.addPage(page);
  }

  return savePdf(output);
}

export async function splitPdfAtRange(
  input: BinaryInput,
  pages: number[],
): Promise<Uint8Array> {
  return extractPdfPages(input, pages);
}

export async function splitPdfIntoPages(
  input: BinaryInput,
  pages: number[],
): Promise<Array<{ page: number; bytes: Uint8Array }>> {
  const source = await loadPdf(input);
  const pageCount = source.getPageCount();

  assertPageList(pages, pageCount);

  const results: Array<{ page: number; bytes: Uint8Array }> = [];

  for (const pageNumber of pages) {
    const output = await PDFDocument.create();
    const [copiedPage] = await output.copyPages(source, [pageNumber - 1]);
    if (!copiedPage) {
      throw new PdfToolError(`Page ${pageNumber} could not be copied.`);
    }
    output.addPage(copiedPage);
    output.setTitle(`Page ${pageNumber}`);
    results.push({ page: pageNumber, bytes: await savePdf(output) });
  }

  return results;
}

export async function getPdfPageCount(input: BinaryInput): Promise<number> {
  const document = await loadPdf(input);
  const pageCount = document.getPageCount();
  if (pageCount < 1) {
    throw new PdfToolError("This PDF does not contain any pages.");
  }
  return pageCount;
}
