"use client";

import { assertPageList, PdfToolError } from "./errors";
import { openPdfWithPdfJs } from "./pdfjs";

export type PdfImageFormat = "jpeg" | "png";

export type RenderedPdfPage = {
  pageNumber: number;
  width: number;
  height: number;
  pageWidth: number;
  pageHeight: number;
  bytes: Uint8Array;
  mimeType: string;
  extension: "jpg" | "png";
};

export type RenderPdfPagesOptions = {
  format: PdfImageFormat;
  scale?: number;
  quality?: number;
  maxDimension?: number;
  grayscale?: boolean;
  pages?: number[];
};

function canvasToBytes(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new PdfToolError(
              "The page was too large to encode as an image. Try a lower resolution.",
            ),
          );
          return;
        }

        blob
          .arrayBuffer()
          .then((buffer) => resolve(new Uint8Array(buffer)))
          .catch(reject);
      },
      mimeType,
      quality,
    );
  });
}

export async function renderPdfPages(
  input: Uint8Array | ArrayBuffer,
  options: RenderPdfPagesOptions,
): Promise<RenderedPdfPage[]> {
  const pdf = await openPdfWithPdfJs(input);
  const mimeType = options.format === "png" ? "image/png" : "image/jpeg";
  const extension = options.format === "png" ? "png" : "jpg";
  const maxDimension = options.maxDimension ?? 4096;

  try {
    const selected =
      options.pages ?? Array.from({ length: pdf.numPages }, (_, index) => index + 1);
    assertPageList(selected, pdf.numPages);

    const rendered: RenderedPdfPage[] = [];

    for (const pageNumber of selected) {
      const page = await pdf.getPage(pageNumber);
      const baseViewport = page.getViewport({ scale: 1 });
      const requestedScale = options.scale ?? 2;
      const largestSide = Math.max(baseViewport.width, baseViewport.height);
      const scale = Math.max(
        0.1,
        Math.min(requestedScale, maxDimension / Math.max(largestSide, 1)),
      );
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      const context = canvas.getContext("2d", { alpha: false });
      if (!context) {
        page.cleanup();
        throw new PdfToolError("This browser could not create a canvas for PDF rendering.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: context, viewport }).promise;

      if (options.grayscale) {
        const image = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = image.data;

        for (let offset = 0; offset < data.length; offset += 4) {
          const red = data[offset] ?? 0;
          const green = data[offset + 1] ?? 0;
          const blue = data[offset + 2] ?? 0;
          const luminance = Math.round(
            red * 0.299 + green * 0.587 + blue * 0.114,
          );
          data[offset] = luminance;
          data[offset + 1] = luminance;
          data[offset + 2] = luminance;
        }

        context.putImageData(image, 0, 0);
      }

      const bytes = await canvasToBytes(
        canvas,
        mimeType,
        options.format === "jpeg" ? (options.quality ?? 0.85) : undefined,
      );

      rendered.push({
        pageNumber,
        width: canvas.width,
        height: canvas.height,
        pageWidth: baseViewport.width,
        pageHeight: baseViewport.height,
        bytes,
        mimeType,
        extension,
      });

      page.cleanup();
    }

    return rendered;
  } finally {
    await pdf.destroy();
  }
}
