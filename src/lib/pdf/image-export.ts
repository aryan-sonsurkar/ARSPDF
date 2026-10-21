"use client";

import type { PdfImageFormat } from "./render";
import { renderPdfPages } from "./render";

export type PdfImageExportOptions = {
  format: PdfImageFormat;
  scale?: number;
  quality?: number;
  pages?: number[];
};

export type PdfImageExportResult = {
  bytes: Uint8Array;
  extension: "jpg" | "png" | "zip";
  mimeType: string;
  pageCount: number;
  singlePage: boolean;
};

export async function exportPdfAsImages(
  input: Uint8Array,
  options: PdfImageExportOptions,
): Promise<PdfImageExportResult> {
  const pages = await renderPdfPages(input, options);

  if (pages.length === 1) {
    const page = pages[0]!;
    return {
      bytes: page.bytes,
      extension: page.extension,
      mimeType: page.mimeType,
      pageCount: 1,
      singlePage: true,
    };
  }

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  for (const page of pages) {
    const number = String(page.pageNumber).padStart(3, "0");
    zip.file(`page-${number}.${page.extension}`, page.bytes);
  }

  const bytes = await zip.generateAsync({
    type: "uint8array",
    compression: "STORE",
  });

  return {
    bytes,
    extension: "zip",
    mimeType: "application/zip",
    pageCount: pages.length,
    singlePage: false,
  };
}
