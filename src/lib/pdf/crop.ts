import type { BinaryInput } from "@/types/pdf";
import { assertPageList, PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export type CropMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type CropOptions = {
  margins: CropMargins;
  pages?: number[];
};

export const MILLIMETERS_TO_POINTS = 72 / 25.4;

export async function cropPdf(
  input: BinaryInput,
  options: CropOptions,
): Promise<Uint8Array> {
  const margins = options.margins;
  const values = [margins.top, margins.right, margins.bottom, margins.left];

  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new PdfToolError("Crop margins must be zero or greater.");
  }

  if (values.every((value) => value === 0)) {
    throw new PdfToolError("Enter at least one crop margin greater than zero.");
  }

  const document = await loadPdf(input);
  const pageCount = document.getPageCount();
  const selected =
    options.pages ?? Array.from({ length: pageCount }, (_, index) => index + 1);
  assertPageList(selected, pageCount);

  for (const pageNumber of selected) {
    const page = document.getPage(pageNumber - 1);
    const media = page.getMediaBox();
    const width = media.width - margins.left - margins.right;
    const height = media.height - margins.top - margins.bottom;

    if (width <= 1 || height <= 1) {
      throw new PdfToolError(
        `The crop margins are too large for page ${pageNumber}. The remaining area must be at least 1 point wide and high.`,
      );
    }

    const x = media.x + margins.left;
    const y = media.y + margins.bottom;
    page.setMediaBox(x, y, width, height);
    page.setCropBox(x, y, width, height);
  }

  return savePdf(document);
}
