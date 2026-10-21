"use client";

import { PdfToolError } from "@/lib/pdf/errors";

export type ConvertPageSize = "a4" | "letter";
export type ConvertOrientation = "portrait" | "landscape";

export type HtmlSection = {
  html: string;
};

export type HtmlToPdfOptions = {
  pageSize?: ConvertPageSize;
  orientation?: ConvertOrientation;
  marginPoints?: number;
  title?: string;
};

const PAGE_POINTS: Record<ConvertPageSize, [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

const MAX_SECTION_HEIGHT_PX = 12000;

const CONVERTER_CSS = `
.arspdf-convert, .arspdf-convert * { box-sizing: border-box; }
.arspdf-section { margin: 0; }
.arspdf-section p { margin: 0 0 8pt; white-space: pre-wrap; overflow-wrap: anywhere; }
.arspdf-section h1 { font-size: 20pt; margin: 0 0 10pt; }
.arspdf-section h2 { font-size: 17pt; margin: 0 0 9pt; }
.arspdf-section h3 { font-size: 14pt; margin: 0 0 8pt; }
.arspdf-section h4, .arspdf-section h5, .arspdf-section h6 { font-size: 12pt; margin: 0 0 8pt; }
.arspdf-section ul, .arspdf-section ol { margin: 0 0 8pt 18pt; padding: 0; }
.arspdf-section table { border-collapse: collapse; width: 100%; table-layout: fixed; margin: 0 0 8pt; }
.arspdf-section td, .arspdf-section th { border: 1px solid #999999; padding: 3pt 4pt; vertical-align: top; font-size: 9pt; white-space: pre-wrap; overflow-wrap: anywhere; }
.arspdf-section .docx-list { padding-left: 16pt; position: relative; }
.arspdf-section .docx-list::before { content: "\\2022"; position: absolute; left: 4pt; }
.arspdf-section img { max-width: 100%; height: auto; }
.arspdf-section .sheet-title { font-size: 14pt; margin: 0 0 8pt; }
.arspdf-section .pptx-kicker { font-size: 9pt; text-transform: uppercase; letter-spacing: 1pt; color: #666666; margin: 0 0 6pt; }
.arspdf-section .pptx-slide h1 { font-size: 24pt; margin: 0 0 12pt; }
.arspdf-section .pptx-slide p { font-size: 14pt; margin: 0 0 8pt; }
`;

function waitForImage(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) return Promise.resolve();

  return new Promise((resolve) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
  });
}

export async function renderHtmlSectionsToPdf(
  sections: HtmlSection[],
  options: HtmlToPdfOptions = {},
): Promise<Uint8Array> {
  if (sections.length === 0) {
    throw new PdfToolError("There is no content to convert.");
  }

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const pageSize = options.pageSize ?? "a4";
  const orientation = options.orientation ?? "portrait";
  const [shortSide, longSide] = PAGE_POINTS[pageSize];
  const [pageWidth, pageHeight] =
    orientation === "portrait" ? [shortSide, longSide] : [longSide, shortSide];
  const margin = options.marginPoints ?? 36;
  const contentWidth = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;
  const widthPx = Math.round((contentWidth / 72) * 96);

  const pdf = new jsPDF({
    orientation,
    unit: "pt",
    format: [pageWidth, pageHeight],
    compress: true,
  });

  const container = document.createElement("div");
  container.className = "arspdf-convert";
  container.style.cssText = `position:absolute;left:-20000px;top:0;width:${widthPx}px;background:#ffffff;color:#111111;font-family:Arial,Helvetica,sans-serif;font-size:12pt;line-height:1.5;`;
  const style = document.createElement("style");
  style.textContent = CONVERTER_CSS;
  container.appendChild(style);
  document.body.appendChild(container);

  let hasPage = true;

  try {
    for (const section of sections) {
      const wrapper = document.createElement("div");
      wrapper.className = "arspdf-section";
      wrapper.innerHTML = section.html;
      container.appendChild(wrapper);

      await Promise.all(
        Array.from(wrapper.querySelectorAll("img")).map(waitForImage),
      );

      const sectionWidth = wrapper.scrollWidth || widthPx;
      const sectionHeight = Math.max(1, wrapper.scrollHeight);

      if (sectionHeight > MAX_SECTION_HEIGHT_PX) {
        throw new PdfToolError(
          "This document is too long to render in a single browser pass. Split it into smaller files and convert each part.",
        );
      }

      const canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: false,
        width: sectionWidth,
        height: sectionHeight,
      });

      if (canvas.width === 0 || canvas.height === 0) {
        throw new PdfToolError("A section of this document produced an empty page.");
      }

      const pageHeightPx = Math.floor(
        (canvas.width * contentHeight) / contentWidth,
      );
      let offset = 0;

      while (offset < canvas.height) {
        if (!hasPage) {
          pdf.addPage([pageWidth, pageHeight], orientation);
        }
        hasPage = false;

        const sliceHeight = Math.min(pageHeightPx, canvas.height - offset);
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceHeight;
        const context = slice.getContext("2d");

        if (!context) {
          throw new PdfToolError("This browser could not prepare the converted page.");
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, slice.width, slice.height);
        context.drawImage(
          canvas,
          0,
          offset,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight,
        );

        const dataUrl = slice.toDataURL("image/jpeg", 0.92);
        const drawHeight = (sliceHeight * contentWidth) / canvas.width;
        pdf.addImage(dataUrl, "JPEG", margin, margin, contentWidth, drawHeight);
        offset += sliceHeight;
      }

      wrapper.remove();
    }
  } finally {
    container.remove();
  }

  pdf.setProperties({
    title: options.title ?? "ArsPDF conversion",
    creator: "ArsPDF",
  });

  return new Uint8Array(pdf.output("arraybuffer"));
}
