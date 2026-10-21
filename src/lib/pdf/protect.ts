import type { BinaryInput } from "@/types/pdf";
import { PdfToolError } from "./errors";
import { loadPdf, savePdf } from "./load";

export const PROTECT_PDF_AVAILABLE = true;

export const PROTECT_PDF_LIMITATION =
  "AES-256 encryption is applied in your browser. The password cannot be recovered, and ArsPDF never receives it.";

export type ProtectPdfOptions = {
  userPassword: string;
  ownerPassword?: string;
  allowPrinting?: boolean;
  allowCopying?: boolean;
  allowModifying?: boolean;
};

export async function protectPdf(
  input: BinaryInput,
  options: ProtectPdfOptions,
): Promise<Uint8Array> {
  const userPassword = options.userPassword ?? "";

  if (userPassword.length < 4) {
    throw new PdfToolError("Use a password with at least 4 characters.");
  }
  if (userPassword.length > 128) {
    throw new PdfToolError("Use a password with no more than 128 characters.");
  }

  const ownerPassword = options.ownerPassword?.trim()
    ? options.ownerPassword
    : userPassword;

  if (ownerPassword.length > 128) {
    throw new PdfToolError("The owner password must be 128 characters or fewer.");
  }

  const document = await loadPdf(input);

  document.encrypt({
    userPassword,
    ownerPassword,
    algorithm: "AES-256",
    permissions: {
      printing: options.allowPrinting === false ? false : "highResolution",
      copying: options.allowCopying !== false,
      modifying: options.allowModifying !== false,
      annotating: options.allowModifying !== false,
      fillingForms: options.allowModifying !== false,
      contentAccessibility: true,
      documentAssembly: options.allowModifying !== false,
    },
  });

  try {
    return await savePdf(document);
  } catch (error) {
    throw new PdfToolError(
      error instanceof Error && error.message.includes("crypto")
        ? "This browser does not expose the Web Crypto API needed for encryption. Try a current version of Chrome, Edge, Firefox, or Safari."
        : "The PDF could not be encrypted. Check that it is a valid, unencrypted document and try again.",
    );
  }
}
