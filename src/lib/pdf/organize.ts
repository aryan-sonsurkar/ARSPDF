import { degrees, PDFDocument } from "pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { assertPageNumber, PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export type OrganizedPage = {
  sourceIndex: number;
  rotation?: number;
};

export async function organizePdf(
  input: BinaryInput,
  pages: OrganizedPage[],
): Promise<Uint8Array> {
  if (pages.length === 0) {
    throw new PdfToolError(
      "Keep at least one page. A PDF cannot be generated with zero pages.",
    );
  }

  const source = await loadPdf(input);
  const pageCount = source.getPageCount();

  for (const page of pages) {
    assertPageNumber(page.sourceIndex + 1, pageCount);
    const rotation = page.rotation ?? 0;
    if (rotation % 90 !== 0) {
      throw new PdfToolError("Page rotation must be a multiple of 90 degrees.");
    }
  }

  const output = await PDFDocument.create();
  output.setTitle("Organized document");
  const copiedPages = await output.copyPages(
    source,
    pages.map((page) => page.sourceIndex),
  );

  copiedPages.forEach((copiedPage, index) => {
    const rotation = pages[index]?.rotation ?? 0;
    if (rotation !== 0) {
      copiedPage.setRotation(degrees((copiedPage.getRotation().angle + rotation) % 360));
    }
    output.addPage(copiedPage);
  });

  return savePdf(output);
}
