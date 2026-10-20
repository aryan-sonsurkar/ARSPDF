import { PDFDocument } from "pdf-lib";
import { normalizePdfError, PdfToolError } from "./errors";

export async function readPdfPageCount(file: File): Promise<number> {
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const document = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
    return document.getPageCount();
  } catch (error) {
    throw new PdfToolError(normalizePdfError(error));
  }
}

export async function readFileBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}
