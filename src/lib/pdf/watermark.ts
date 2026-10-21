import { degrees, StandardFonts, rgb } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { assertPageList, PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export type WatermarkPlacement =
  | "center"
  | "diagonal"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

export type WatermarkOptions = {
  text: string;
  opacity?: number;
  fontSize?: number;
  rotation?: number;
  placement?: WatermarkPlacement;
  pages?: number[];
};

const MARGIN = 36;

export async function addTextWatermark(
  input: BinaryInput,
  options: WatermarkOptions,
): Promise<Uint8Array> {
  const text = options.text.trim();
  if (text.length === 0) {
    throw new PdfToolError("Enter the watermark text.");
  }
  if (text.length > 200) {
    throw new PdfToolError("Keep watermark text under 200 characters.");
  }

  const opacity = options.opacity ?? 0.2;
  const fontSize = options.fontSize ?? 48;
  const placement = options.placement ?? "diagonal";
  const rotation = options.rotation ?? (placement === "diagonal" ? 45 : 0);

  if (!Number.isFinite(opacity) || opacity < 0.05 || opacity > 1) {
    throw new PdfToolError("Opacity must be between 5% and 100%.");
  }
  if (!Number.isFinite(fontSize) || fontSize < 8 || fontSize > 160) {
    throw new PdfToolError("Choose a font size between 8 and 160 points.");
  }
  if (!Number.isFinite(rotation) || rotation < -180 || rotation > 180) {
    throw new PdfToolError("Rotation must be between -180 and 180 degrees.");
  }

  const document = await loadPdf(input);
  const pageCount = document.getPageCount();
  const pages = options.pages ?? Array.from({ length: pageCount }, (_, i) => i + 1);
  assertPageList(pages, pageCount);

  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));

  for (const pageNumber of pages) {
    const page = document.getPage(pageNumber - 1);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);
    const boundingWidth = textWidth * cos + textHeight * sin;
    const boundingHeight = textWidth * sin + textHeight * cos;

    let x = (page.getWidth() - boundingWidth) / 2;
    let y = (page.getHeight() - boundingHeight) / 2;

    if (placement === "top-left") {
      x = MARGIN;
      y = page.getHeight() - MARGIN - boundingHeight;
    } else if (placement === "top-right") {
      x = page.getWidth() - MARGIN - boundingWidth;
      y = page.getHeight() - MARGIN - boundingHeight;
    } else if (placement === "bottom-left") {
      x = MARGIN;
      y = MARGIN;
    } else if (placement === "bottom-right") {
      x = page.getWidth() - MARGIN - boundingWidth;
      y = MARGIN;
    }

    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.62, 0.64, 0.7),
      opacity,
      rotate: degrees(rotation),
    });
  }

  return savePdf(document);
}
