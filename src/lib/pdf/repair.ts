"use client";

import { PDFDocument } from "@cantoo/pdf-lib";
import { PdfToolError } from "./errors";
import { savePdf } from "./load";
import { renderPdfPages } from "./render";

export type RepairResult = {
  bytes: Uint8Array;
  mode: "normalized" | "rebuilt";
};

function trimToPdfHeader(bytes: Uint8Array): Uint8Array {
  const header = [0x25, 0x50, 0x44, 0x46, 0x2d];
  const limit = Math.min(bytes.length - header.length, 4096);

  for (let index = 0; index <= limit; index += 1) {
    let matches = true;
    for (let offset = 0; offset < header.length; offset += 1) {
      if (bytes[index + offset] !== header[offset]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return index === 0 ? bytes : bytes.slice(index);
    }
  }

  return bytes;
}

export async function repairPdf(input: Uint8Array): Promise<RepairResult> {
  const normalized = trimToPdfHeader(input);

  try {
    const document = await PDFDocument.load(normalized, {
      ignoreEncryption: false,
      updateMetadata: false,
    });

    if (document.getPageCount() === 0) {
      throw new PdfToolError("This PDF does not contain any pages to recover.");
    }

    return { bytes: await savePdf(document), mode: "normalized" };
  } catch (error) {
    if (error instanceof PdfToolError) throw error;

    const message = error instanceof Error ? error.message.toLowerCase() : "";
    if (message.includes("encrypt") || message.includes("password")) {
      throw new PdfToolError(
        "This PDF is password-protected. Remove the password in a trusted app before repairing it.",
      );
    }
  }

  let pages;

  try {
    pages = await renderPdfPages(normalized, {
      format: "jpeg",
      scale: 1.5,
      quality: 0.85,
    });
  } catch {
    throw new PdfToolError(
      "This PDF is too damaged to recover in the browser. Try the file in a desktop PDF reader or ask the sender for a fresh copy.",
    );
  }

  if (pages.length === 0) {
    throw new PdfToolError("This PDF does not contain any pages to recover.");
  }

  const output = await PDFDocument.create();
  output.setTitle("Repaired PDF");

  for (const page of pages) {
    const embedded = await output.embedJpg(page.bytes);
    const added = output.addPage([page.pageWidth, page.pageHeight]);
    added.drawImage(embedded, {
      x: 0,
      y: 0,
      width: page.pageWidth,
      height: page.pageHeight,
    });
  }

  return { bytes: await savePdf(output), mode: "rebuilt" };
}
