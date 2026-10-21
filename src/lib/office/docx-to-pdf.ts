"use client";

import { docxToHtml } from "./docx-reader";
import {
  renderHtmlSectionsToPdf,
  type ConvertOrientation,
  type ConvertPageSize,
} from "./html-to-pdf";

export type DocxToPdfOptions = {
  pageSize?: ConvertPageSize;
  orientation?: ConvertOrientation;
};

export async function docxToPdf(
  bytes: Uint8Array,
  options: DocxToPdfOptions = {},
): Promise<Uint8Array> {
  const html = await docxToHtml(bytes);

  return renderHtmlSectionsToPdf([{ html }], {
    pageSize: options.pageSize ?? "a4",
    orientation: options.orientation ?? "portrait",
    title: "Word to PDF",
  });
}
