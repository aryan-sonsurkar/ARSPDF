import type { BinaryInput } from "@/types/pdf";
import { assertPageList, PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export async function deletePdfPages(
  input: BinaryInput,
  pagesToDelete: number[],
): Promise<Uint8Array> {
  const document = await loadPdf(input);
  const pageCount = document.getPageCount();

  assertPageList(pagesToDelete, pageCount);

  const uniquePages = Array.from(new Set(pagesToDelete));
  if (uniquePages.length >= pageCount) {
    throw new PdfToolError(
      "You selected every page. Keep at least one page to create a valid PDF.",
    );
  }

  const sortedDescending = [...uniquePages].sort((a, b) => b - a);
  for (const pageNumber of sortedDescending) {
    document.removePage(pageNumber - 1);
  }

  return savePdf(document);
}
