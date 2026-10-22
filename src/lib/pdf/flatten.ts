import { PDFName } from "@cantoo/pdf-lib";
import type { BinaryInput } from "@/types/pdf";
import { PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export type FlattenPdfOptions = {
  forms?: boolean;
  annotations?: boolean;
};

export async function flattenPdf(
  input: BinaryInput,
  options: FlattenPdfOptions = {},
): Promise<Uint8Array> {
  const flattenForms = options.forms ?? true;
  const removeAnnotations = options.annotations ?? true;

  if (!flattenForms && !removeAnnotations) {
    throw new PdfToolError("Choose at least one flatten option.");
  }

  const document = await loadPdf(input);
  const pageCount = document.getPageCount();

  if (pageCount < 1) {
    throw new PdfToolError("This PDF does not contain any pages.");
  }

  if (flattenForms) {
    try {
      const form = document.getForm();
      if (form.getFields().length > 0) {
        form.flatten();
      }
    } catch {
      throw new PdfToolError(
        "The form fields in this PDF could not be flattened. Try removing annotations only.",
      );
    }
  }

  if (removeAnnotations) {
    for (const page of document.getPages()) {
      page.node.delete(PDFName.of("Annots"));
    }
  }

  return savePdf(document);
}
