import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";
import { PdfToolError } from "./errors";
import { savePdf } from "./load";
import { toWinAnsiText } from "./win-ansi";

export type TextToPdfPageSize = "a4" | "letter";

export type TextToPdfOptions = {
  fontSize?: number;
  pageSize?: TextToPdfPageSize;
  margin?: number;
};

const PAGE_SIZES: Record<TextToPdfPageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 32;

export function wrapParagraph(
  paragraph: string,
  measure: (value: string) => number,
  maxWidth: number,
): string[] {
  if (paragraph.length === 0) return [""];

  const words = paragraph.split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return [""];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current.length === 0 ? word : `${current} ${word}`;

    if (measure(candidate) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current.length > 0) {
      lines.push(current);
      current = "";
    }

    let remaining = word;
    while (measure(remaining) > maxWidth && remaining.length > 1) {
      let cut = remaining.length - 1;
      while (cut > 1 && measure(remaining.slice(0, cut)) > maxWidth) {
        cut -= 1;
      }
      lines.push(remaining.slice(0, cut));
      remaining = remaining.slice(cut);
    }

    current = remaining;
  }

  if (current.length > 0) lines.push(current);

  return lines.length > 0 ? lines : [""];
}

export async function textToPdf(
  text: string,
  options: TextToPdfOptions = {},
): Promise<Uint8Array> {
  const clean = toWinAnsiText(text.replace(/\r\n?/g, "\n"));

  if (clean.trim().length === 0) {
    throw new PdfToolError("Add some text to convert into a PDF.");
  }

  const fontSize = options.fontSize ?? 12;
  if (!Number.isFinite(fontSize) || fontSize < MIN_FONT_SIZE || fontSize > MAX_FONT_SIZE) {
    throw new PdfToolError(
      `Choose a font size between ${MIN_FONT_SIZE} and ${MAX_FONT_SIZE} points.`,
    );
  }

  const pageSize = options.pageSize ?? "a4";
  const [pageWidth, pageHeight] = PAGE_SIZES[pageSize];
  const margin = options.margin ?? 54;

  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  const maxWidth = Math.max(pageWidth - margin * 2, 10);
  const measure = (value: string) => font.widthOfTextAtSize(value, fontSize);

  const lines: string[] = [];
  for (const paragraph of clean.split("\n")) {
    if (paragraph.trim().length === 0) {
      lines.push("");
      continue;
    }
    lines.push(...wrapParagraph(paragraph, measure, maxWidth));
  }

  const lineHeight = fontSize * 1.45;
  const firstBaseline = pageHeight - margin - fontSize;
  const lastBaseline = margin + fontSize * 0.25;

  let page = document.addPage([pageWidth, pageHeight]);
  let y = firstBaseline;

  for (const line of lines) {
    if (y < lastBaseline) {
      page = document.addPage([pageWidth, pageHeight]);
      y = firstBaseline;
    }

    if (line.length > 0) {
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0.12, 0.12, 0.14),
      });
    }

    y -= lineHeight;
  }

  return savePdf(document);
}
