"use client";

import { PdfToolError } from "@/lib/pdf/errors";
import { escapeHtml } from "./html-escape";
import {
  renderHtmlSectionsToPdf,
  type ConvertOrientation,
  type ConvertPageSize,
} from "./html-to-pdf";
import { readXlsx } from "./xlsx-reader";
import type { XlsxSheet } from "./xlsx-writer";

export type XlsxToPdfOptions = {
  pageSize?: ConvertPageSize;
  orientation?: ConvertOrientation;
};

const ROWS_PER_SECTION = 60;

function sheetSection(
  sheet: XlsxSheet,
  rows: string[][],
  part: number,
): string {
  const title =
    part === 0 ? sheet.name : `${sheet.name} (continued ${part + 1})`;
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row
          .map((value) => `<td>${escapeHtml(value)}</td>`)
          .join("")}</tr>`,
    )
    .join("");

  return `<p class="sheet-title">${escapeHtml(title)}</p><table class="sheet-table"><tbody>${tableRows}</tbody></table>`;
}

export async function xlsxToPdf(
  bytes: Uint8Array,
  options: XlsxToPdfOptions = {},
): Promise<Uint8Array> {
  const sheets = await readXlsx(bytes);
  const sections: Array<{ html: string }> = [];

  for (const sheet of sheets) {
    if (sheet.rows.length === 0) continue;

    for (let start = 0; start < sheet.rows.length; start += ROWS_PER_SECTION) {
      const chunk = sheet.rows.slice(start, start + ROWS_PER_SECTION);
      sections.push({ html: sheetSection(sheet, chunk, start / ROWS_PER_SECTION) });
    }
  }

  if (sections.length === 0) {
    throw new PdfToolError("This workbook does not contain any cell data to convert.");
  }

  return renderHtmlSectionsToPdf(sections, {
    pageSize: options.pageSize ?? "a4",
    orientation: options.orientation ?? "landscape",
    title: "Excel to PDF",
  });
}
