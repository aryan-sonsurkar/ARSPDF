import { PDFDocument } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";

export function toUint8Array(input: BinaryInput): Uint8Array {
  return input instanceof Uint8Array ? input : new Uint8Array(input);
}

export async function loadPdf(input: BinaryInput): Promise<PDFDocument> {
  const bytes = toUint8Array(input);
  return PDFDocument.load(bytes, {
    ignoreEncryption: false,
    updateMetadata: false,
  });
}

export async function savePdf(document: PDFDocument): Promise<Uint8Array> {
  document.setCreator("ArsPDF");
  document.setProducer("ArsPDF");
  return document.save();
}
