"use client";

import { PdfToolError } from "@/lib/pdf/errors";

export type PptxSlide = {
  slideNumber: number;
  title: string;
  paragraphs: string[];
};

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function readPptxSlides(bytes: Uint8Array): Promise<PptxSlide[]> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(bytes);

  const slideFiles = Object.keys(zip.files)
    .map((path) => ({
      path,
      match: /^ppt\/slides\/slide(\d+)\.xml$/.exec(path),
    }))
    .filter(
      (entry): entry is { path: string; match: RegExpExecArray } =>
        entry.match !== null,
    )
    .sort((a, b) => Number(a.match[1]) - Number(b.match[1]));

  if (slideFiles.length === 0) {
    throw new PdfToolError(
      "This does not look like a PPTX file. Legacy .ppt files are not supported.",
    );
  }

  const slides: PptxSlide[] = [];

  for (const [index, entry] of slideFiles.entries()) {
    const file = zip.file(entry.path);
    if (!file) continue;

    const document = new DOMParser().parseFromString(
      await file.async("string"),
      "application/xml",
    );

    const paragraphs = Array.from(document.getElementsByTagNameNS("*", "p"))
      .map((paragraph) =>
        clean(
          Array.from(paragraph.getElementsByTagNameNS("*", "t"))
            .map((node) => node.textContent ?? "")
            .join(" "),
        ),
      )
      .filter((value) => value.length > 0);

    slides.push({
      slideNumber: index + 1,
      title: paragraphs[0] ?? `Slide ${index + 1}`,
      paragraphs: paragraphs.slice(1),
    });
  }

  return slides;
}
