export class PdfToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfToolError";
  }
}

export function normalizePdfError(error: unknown): string {
  if (error instanceof PdfToolError) {
    return error.message;
  }

  const message =
    error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = message.toLowerCase();

  if (
    lower.includes("encrypted") ||
    lower.includes("password") ||
    lower.includes("decrypt")
  ) {
    return "This PDF is password-protected or encrypted. Remove the password in a trusted app, then try again.";
  }

  if (
    lower.includes("invalid pdf") ||
    lower.includes("failed to parse") ||
    lower.includes("no pdf header") ||
    lower.includes("not a pdf") ||
    lower.includes("unexpected end of file")
  ) {
    return "That file does not appear to be a valid PDF. It may be corrupted or only partially downloaded.";
  }

  if (
    lower.includes("out of memory") ||
    lower.includes("allocation failed") ||
    lower.includes("array buffer allocation")
  ) {
    return "The browser ran out of memory while processing this document. Try fewer or smaller files.";
  }

  if (lower.includes("cannot embed") || lower.includes("unsupported image")) {
    return "One of the images could not be embedded. Re-export it as a standard JPG or PNG and try again.";
  }

  return "The document could not be processed. Check that the file is a valid, unencrypted PDF and try again.";
}

export function assertPageNumber(page: number, pageCount: number): void {
  if (!Number.isInteger(page) || page < 1 || page > pageCount) {
    throw new PdfToolError(
      `Page ${String(page)} does not exist. This document has ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
    );
  }
}

export function assertPageList(pages: number[], pageCount: number): void {
  if (pages.length === 0) {
    throw new PdfToolError("Select at least one page.");
  }
  for (const page of pages) {
    assertPageNumber(page, pageCount);
  }
}
