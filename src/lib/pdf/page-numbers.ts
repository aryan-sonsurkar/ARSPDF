import { StandardFonts, rgb } from "@cantoo/pdf-lib";
import type { BinaryInput, PdfPagePosition } from "@/types/pdf";
import { assertPageList, PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export type PageNumberOptions = {
  startNumber?: number;
  position?: PdfPagePosition;
  fontSize?: number;
  pages?: number[];
};

const MARGIN = 28;

function positionFor(
  pageWidth: number,
  pageHeight: number,
  textWidth: number,
  baselineOffset: number,
  position: PdfPagePosition,
): { x: number; y: number } {
  const vertical = position.startsWith("top")
    ? pageHeight - MARGIN - baselineOffset
    : MARGIN;

  if (position.endsWith("left")) {
    return { x: MARGIN, y: vertical };
  }
  if (position.endsWith("right")) {
    return { x: pageWidth - MARGIN - textWidth, y: vertical };
  }
  return { x: (pageWidth - textWidth) / 2, y: vertical };
}

export async function addPageNumbers(
  input: BinaryInput,
  options: PageNumberOptions = {},
): Promise<Uint8Array> {
  const document = await loadPdf(input);
  const pageCount = document.getPageCount();
  const startNumber = options.startNumber ?? 1;
  const position = options.position ?? "bottom-center";
  const fontSize = options.fontSize ?? 12;
  const pages = options.pages ?? Array.from({ length: pageCount }, (_, i) => i + 1);

  if (!Number.isInteger(startNumber) || startNumber < 0) {
    throw new PdfToolError("The starting number must be a whole number of 0 or more.");
  }
  if (!Number.isFinite(fontSize) || fontSize < 6 || fontSize > 72) {
    throw new PdfToolError("Choose a font size between 6 and 72 points.");
  }

  assertPageList(pages, pageCount);

  const font = await document.embedFont(StandardFonts.Helvetica);
  let currentNumber = startNumber;
  const color = rgb(0.32, 0.34, 0.4);

  for (const pageNumber of pages) {
    const page = document.getPage(pageNumber - 1);
    const label = String(currentNumber);
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    const baselineOffset = font.heightAtSize(fontSize) * 0.7;
    const { x, y } = positionFor(
      page.getWidth(),
      page.getHeight(),
      textWidth,
      baselineOffset,
      position,
    );

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color,
    });

    currentNumber += 1;
  }

  return savePdf(document);
}
