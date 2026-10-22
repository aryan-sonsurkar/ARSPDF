import { PDFDocument, StandardFonts, rgb, type PDFPage } from "@cantoo/pdf-lib";
import { parseCsv } from "@/lib/csv";
import { PdfToolError } from "./errors";
import { savePdf } from "./load";
import { toWinAnsiText } from "./win-ansi";

export type CsvToPdfPageSize = "a4" | "letter";
export type CsvToPdfOrientation = "portrait" | "landscape";

export type CsvToPdfOptions = {
  headerRow?: boolean;
  fontSize?: number;
  pageSize?: CsvToPdfPageSize;
  orientation?: CsvToPdfOrientation;
};

const PAGE_SIZES: Record<CsvToPdfPageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const MIN_FONT_SIZE = 6;
const MAX_FONT_SIZE = 16;
const MARGIN = 36;
const CELL_PADDING = 4;

function truncateToWidth(
  text: string,
  measure: (value: string) => number,
  maxWidth: number,
): string {
  if (maxWidth <= 0) return "";
  if (measure(text) <= maxWidth) return text;

  const ellipsis = "...";
  const ellipsisWidth = measure(ellipsis);
  let result = text;

  while (result.length > 0 && measure(result) + ellipsisWidth > maxWidth) {
    result = result.slice(0, -1);
  }

  return result.length > 0 ? `${result}${ellipsis}` : ellipsis;
}

export async function csvToPdf(
  csvText: string,
  options: CsvToPdfOptions = {},
): Promise<Uint8Array> {
  const rows = parseCsv(csvText);

  if (rows.length === 0) {
    throw new PdfToolError("This CSV file does not contain any rows.");
  }

  const columnCount = Math.max(...rows.map((row) => row.length));
  if (columnCount < 1) {
    throw new PdfToolError("This CSV file does not contain any columns.");
  }

  const headerRow = options.headerRow ?? true;
  const fontSize = options.fontSize ?? 9;

  if (!Number.isFinite(fontSize) || fontSize < MIN_FONT_SIZE || fontSize > MAX_FONT_SIZE) {
    throw new PdfToolError(
      `Choose a font size between ${MIN_FONT_SIZE} and ${MAX_FONT_SIZE} points.`,
    );
  }

  const pageSize = options.pageSize ?? "a4";
  const orientation = options.orientation ?? "portrait";
  const baseSize = PAGE_SIZES[pageSize];
  const [pageWidth, pageHeight] =
    orientation === "landscape"
      ? [baseSize[1], baseSize[0]]
      : [baseSize[0], baseSize[1]];

  const availableWidth = pageWidth - MARGIN * 2;

  const document = await PDFDocument.create();
  const regular = await document.embedFont(StandardFonts.Helvetica);
  const bold = await document.embedFont(StandardFonts.HelveticaBold);

  const normalized = rows.map((row) =>
    Array.from({ length: columnCount }, (_, column) =>
      toWinAnsiText((row[column] ?? "").replace(/\s+/g, " ").trim()),
    ),
  );

  const naturalWidths = Array.from({ length: columnCount }, (_, column) => {
    let widest = 0;
    for (const row of normalized) {
      widest = Math.max(
        widest,
        regular.widthOfTextAtSize(row[column] ?? "", fontSize),
      );
    }
    return Math.max(24, widest + CELL_PADDING * 2);
  });

  const naturalTotal = naturalWidths.reduce((total, width) => total + width, 0);
  let columnWidths: number[];

  if (naturalTotal > availableWidth) {
    const scale = availableWidth / naturalTotal;
    columnWidths = naturalWidths.map((width) => width * scale);
  } else {
    const extra = availableWidth - naturalTotal;
    const weight = naturalTotal > 0 ? naturalTotal : columnCount;
    columnWidths = naturalWidths.map(
      (width) => width + extra * (width / weight),
    );
  }

  const rowHeight = fontSize * 1.7;
  const usableHeight = pageHeight - MARGIN * 2;
  const rowsPerPage = Math.max(1, Math.floor(usableHeight / rowHeight));

  function drawRow(
    page: PDFPage,
    cells: string[],
    top: number,
    isHeader: boolean,
  ): void {
    const font = isHeader ? bold : regular;

    if (isHeader) {
      page.drawRectangle({
        x: MARGIN,
        y: top - rowHeight,
        width: availableWidth,
        height: rowHeight,
        color: rgb(0.9, 0.91, 0.87),
      });
    }

    let x = MARGIN;

    for (let column = 0; column < columnCount; column += 1) {
      const cellWidth = columnWidths[column] ?? 0;
      const maxTextWidth = Math.max(cellWidth - CELL_PADDING * 2, 0);
      const text = truncateToWidth(
        cells[column] ?? "",
        (value) => font.widthOfTextAtSize(value, fontSize),
        maxTextWidth,
      );

      page.drawText(text, {
        x: x + CELL_PADDING,
        y: top - rowHeight + (rowHeight - fontSize) / 2 + fontSize * 0.22,
        size: fontSize,
        font,
        color: rgb(0.15, 0.15, 0.17),
      });

      x += cellWidth;
    }

    if (isHeader) {
      page.drawLine({
        start: { x: MARGIN, y: top - rowHeight },
        end: { x: MARGIN + availableWidth, y: top - rowHeight },
        thickness: 0.8,
        color: rgb(0.35, 0.35, 0.35),
      });
    }
  }

  let page = document.addPage([pageWidth, pageHeight]);
  let top = pageHeight - MARGIN;
  let usedOnPage = 0;

  if (headerRow) {
    drawRow(page, normalized[0] ?? [], top, true);
    top -= rowHeight;
    usedOnPage += 1;
  }

  const firstDataRow = headerRow ? 1 : 0;

  for (let index = firstDataRow; index < normalized.length; index += 1) {
    if (usedOnPage >= rowsPerPage) {
      page = document.addPage([pageWidth, pageHeight]);
      top = pageHeight - MARGIN;
      usedOnPage = 0;

      if (headerRow) {
        drawRow(page, normalized[0] ?? [], top, true);
        top -= rowHeight;
        usedOnPage += 1;
      }
    }

    drawRow(page, normalized[index] ?? [], top, false);
    top -= rowHeight;
    usedOnPage += 1;
  }

  return savePdf(document);
}
