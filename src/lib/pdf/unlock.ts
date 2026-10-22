import { PDFDocument } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { normalizePdfError, PdfToolError } from "./errors";
import { savePdf } from "./load";

export async function unlockPdf(
  input: BinaryInput,
  password: string,
): Promise<Uint8Array> {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);

  let decrypted: PDFDocument;

  try {
    decrypted = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
      password,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (
      message.includes("password") ||
      message.includes("encrypted") ||
      message.includes("decrypt")
    ) {
      throw new PdfToolError(
        "That password did not unlock this PDF. Check the password and try again.",
      );
    }
    throw new PdfToolError(normalizePdfError(error));
  }

  if (decrypted.getPageCount() < 1) {
    throw new PdfToolError("This PDF does not contain any pages.");
  }

  const output = await PDFDocument.create();
  const pages = await output.copyPages(decrypted, decrypted.getPageIndices());

  for (const page of pages) {
    output.addPage(page);
  }

  return savePdf(output);
}
