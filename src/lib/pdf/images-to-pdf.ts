import { PDFDocument, PageSizes } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { PdfToolError } from "./errors";
import { savePdf, toUint8Array } from "./load";

export type ImagePageSize = "a4" | "letter" | "fit";
export type ImageOrientation = "auto" | "portrait" | "landscape";

export type ImageSource = {
  name: string;
  data: BinaryInput;
  type?: string;
};

export type ImageToPdfOptions = {
  pageSize?: ImagePageSize;
  orientation?: ImageOrientation;
  margin?: number;
};

type DetectedImage = "jpeg" | "png";

function detectImageType(bytes: Uint8Array, declaredType?: string): DetectedImage {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  if (declaredType === "image/jpeg" || declaredType === "image/jpg") return "jpeg";
  if (declaredType === "image/png") return "png";

  throw new PdfToolError(
    "One of the images is not a valid JPG or PNG. Re-export it and try again.",
  );
}

export async function imagesToPdf(
  images: ImageSource[],
  options: ImageToPdfOptions = {},
): Promise<Uint8Array> {
  if (images.length === 0) {
    throw new PdfToolError("Add at least one JPG or PNG image.");
  }

  const pageSize = options.pageSize ?? "a4";
  const orientation = options.orientation ?? "auto";
  const margin = options.margin ?? 24;

  if (!Number.isFinite(margin) || margin < 0 || margin > 144) {
    throw new PdfToolError("Margin must be between 0 and 144 points.");
  }

  const document = await PDFDocument.create();
  document.setTitle("Images");

  for (const image of images) {
    const bytes = toUint8Array(image.data);
    const kind = detectImageType(bytes, image.type);
    const embedded = kind === "jpeg"
      ? await document.embedJpg(bytes)
      : await document.embedPng(bytes);

    let pageWidth: number;
    let pageHeight: number;

    if (pageSize === "fit") {
      pageWidth = embedded.width + margin * 2;
      pageHeight = embedded.height + margin * 2;
    } else {
      const base = pageSize === "letter" ? PageSizes.Letter : PageSizes.A4;
      const isLandscape =
        orientation === "landscape" ||
        (orientation === "auto" && embedded.width > embedded.height);
      pageWidth = isLandscape ? base[1] : base[0];
      pageHeight = isLandscape ? base[0] : base[1];
    }

    if (pageWidth <= 0 || pageHeight <= 0) {
      throw new PdfToolError(
        `"${image.name}" has invalid dimensions and cannot be placed on a page.`,
      );
    }

    const page = document.addPage([pageWidth, pageHeight]);
    const availableWidth = Math.max(pageWidth - margin * 2, 1);
    const availableHeight = Math.max(pageHeight - margin * 2, 1);
    const scale = Math.min(
      availableWidth / embedded.width,
      availableHeight / embedded.height,
    );
    const drawWidth = embedded.width * scale;
    const drawHeight = embedded.height * scale;

    page.drawImage(embedded, {
      x: (pageWidth - drawWidth) / 2,
      y: (pageHeight - drawHeight) / 2,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return savePdf(document);
}
