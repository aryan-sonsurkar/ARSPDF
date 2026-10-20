export const PROTECT_PDF_AVAILABLE = false;

export const PROTECT_PDF_LIMITATION =
  "pdf-lib cannot encrypt PDFs, and the available browser builds of encryption engines are not reliable enough to ship. ArsPDF does not pretend to add a password when it cannot enforce one. Use your PDF viewer or operating system's built-in export tools to encrypt a document.";

export async function protectPdf(): Promise<Uint8Array> {
  throw new Error(
    "Password protection is unavailable. ArsPDF does not ship fake encryption.",
  );
}
