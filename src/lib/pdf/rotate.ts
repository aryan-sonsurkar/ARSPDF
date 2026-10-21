import { degrees } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { assertPageList, PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export type RotationAngle = 90 | 180 | 270;

export type RotateOptions = {
  rotation: RotationAngle;
  pages?: number[];
};

export async function rotatePdf(
  input: BinaryInput,
  options: RotateOptions,
): Promise<Uint8Array> {
  const { rotation } = options;
  if (rotation !== 90 && rotation !== 180 && rotation !== 270) {
    throw new PdfToolError("Choose a rotation of 90, 180, or 270 degrees.");
  }

  const document = await loadPdf(input);
  const pageCount = document.getPageCount();
  const pages = options.pages ?? Array.from({ length: pageCount }, (_, i) => i + 1);

  assertPageList(pages, pageCount);

  for (const pageNumber of pages) {
    const page = document.getPage(pageNumber - 1);
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + rotation) % 360));
  }

  return savePdf(document);
}
