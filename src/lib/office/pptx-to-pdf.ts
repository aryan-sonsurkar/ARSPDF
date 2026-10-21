"use client";

import { escapeHtml } from "./html-escape";
import { renderHtmlSectionsToPdf } from "./html-to-pdf";
import { readPptxSlides } from "./pptx-reader";

export async function pptxToPdf(bytes: Uint8Array): Promise<Uint8Array> {
  const slides = await readPptxSlides(bytes);

  const sections = slides.map((slide) => {
    const body = slide.paragraphs
      .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
      .join("");

    return {
      html: `<div class="pptx-slide"><p class="pptx-kicker">Slide ${slide.slideNumber}</p><h1>${escapeHtml(
        slide.title,
      )}</h1>${body}</div>`,
    };
  });

  return renderHtmlSectionsToPdf(sections, {
    pageSize: "a4",
    orientation: "landscape",
    title: "PowerPoint to PDF",
  });
}
