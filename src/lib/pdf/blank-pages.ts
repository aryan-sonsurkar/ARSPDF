import { PageSizes } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export type BlankPagePosition = "start" | "end";
export type BlankPageSize = "match-first" | "a4" | "letter";

export type AddBlankPagesOptions = {
  count?: number;
  position?: BlankPagePosition;
  size?: BlankPageSize;
};

const MAX_BLANK_PAGES = 50;

export async function addBlankPages(
  input: BinaryInput,
  options: AddBlankPagesOptions = {},
): Promise<Uint8Array> {
  const count = options.count ?? 1;
  const position = options.position ?? "end";
  const size = options.size ?? "match-first";

  if (!Number.isInteger(count) || count < 1 || count > MAX_BLANK_PAGES) {
    throw new PdfToolError(
      `Choose between 1 and ${MAX_BLANK_PAGES} blank pages.`,
    );
  }
  if (position !== "start" && position !== "end") {
    throw new PdfToolError("Choose whether to add pages at the start or end.");
  }

  const document = await loadPdf(input);
  const firstPage = document.getPage(0);

  if (!firstPage) {
    throw new PdfToolError("This PDF does not contain any pages.");
  }

  const dimensions: [number, number] =
    size === "letter"
      ? [PageSizes.Letter[0], PageSizes.Letter[1]]
      : size === "a4"
        ? [PageSizes.A4[0], PageSizes.A4[1]]
        : [firstPage.getWidth(), firstPage.getHeight()];

  for (let index = 0; index < count; index += 1) {
    if (position === "start") {
      document.insertPage(index, dimensions);
    } else {
      document.addPage(dimensions);
    }
  }

  return savePdf(document);
}
