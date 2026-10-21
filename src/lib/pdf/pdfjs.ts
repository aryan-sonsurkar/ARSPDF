"use client";

import type { PDFDocumentProxy } from "pdfjs-dist";

let workerConfigured = false;

export async function getPdfJs() {
  const pdfjs = await import("pdfjs-dist");

  if (!workerConfigured) {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    workerConfigured = true;
  }

  return pdfjs;
}

export async function openPdfWithPdfJs(
  input: Uint8Array | ArrayBuffer,
): Promise<PDFDocumentProxy> {
  const pdfjs = await getPdfJs();
  const data = input instanceof Uint8Array ? input : new Uint8Array(input);

  return pdfjs.getDocument({
    data,
    isEvalSupported: false,
    useSystemFonts: true,
    standardFontDataUrl: "/pdfjs/standard_fonts/",
    cMapUrl: "/pdfjs/cmaps/",
    cMapPacked: true,
  }).promise;
}
