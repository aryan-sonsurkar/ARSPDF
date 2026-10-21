import { describe, expect, it } from "vitest";
import { PDFDocument } from "@cantoo/pdf-lib";
import { createJpeg, createPdf, ONE_PIXEL_PNG } from "./helpers";
import { mergePdfs } from "@/lib/pdf/merge";
import {
  extractPdfPages,
  splitPdfIntoPages,
  getPdfPageCount,
} from "@/lib/pdf/split";
import { organizePdf } from "@/lib/pdf/organize";
import { rotatePdf } from "@/lib/pdf/rotate";
import { deletePdfPages } from "@/lib/pdf/delete-pages";
import { imagesToPdf } from "@/lib/pdf/images-to-pdf";
import { addPageNumbers } from "@/lib/pdf/page-numbers";
import { addTextWatermark } from "@/lib/pdf/watermark";

async function pageWidths(bytes: Uint8Array): Promise<number[]> {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map((page) => page.getWidth());
}

describe("mergePdfs", () => {
  it("merges multiple PDFs and preserves source page order", async () => {
    const first = await createPdf([200, 300]);
    const second = await createPdf([400]);
    const merged = await mergePdfs([
      { name: "first.pdf", data: first },
      { name: "second.pdf", data: second },
    ]);

    const document = await PDFDocument.load(merged);
    expect(document.getPageCount()).toBe(3);
    expect(await pageWidths(merged)).toEqual([200, 300, 400]);
  });

  it("rejects a single input file", async () => {
    const only = await createPdf([200]);
    await expect(
      mergePdfs([{ name: "only.pdf", data: only }]),
    ).rejects.toThrow(/at least two/i);
  });

  it("rejects corrupted input", async () => {
    const valid = await createPdf([200]);
    const corrupted = new TextEncoder().encode("this is not a pdf");
    await expect(
      mergePdfs([
        { name: "valid.pdf", data: valid },
        { name: "broken.pdf", data: corrupted },
      ]),
    ).rejects.toThrow();
  });
});

describe("split and extract", () => {
  it("extracts a single page", async () => {
    const source = await createPdf([200, 300, 400]);
    const extracted = await extractPdfPages(source, [2]);
    expect(await pageWidths(extracted)).toEqual([300]);
  });

  it("extracts multiple pages in the requested order", async () => {
    const source = await createPdf([200, 300, 400]);
    const extracted = await extractPdfPages(source, [3, 1]);
    expect(await pageWidths(extracted)).toEqual([400, 200]);
  });

  it("rejects an out-of-bounds page", async () => {
    const source = await createPdf([200, 300]);
    await expect(extractPdfPages(source, [5])).rejects.toThrow(/does not exist/i);
  });

  it("rejects an empty selection", async () => {
    const source = await createPdf([200, 300]);
    await expect(extractPdfPages(source, [])).rejects.toThrow(/at least one/i);
  });

  it("creates one PDF per selected page", async () => {
    const source = await createPdf([200, 300, 400]);
    const pages = await splitPdfIntoPages(source, [1, 3]);
    expect(pages).toHaveLength(2);
    expect(pages[0]?.page).toBe(1);
    expect(await pageWidths(pages[0]!.bytes)).toEqual([200]);
    expect(await pageWidths(pages[1]!.bytes)).toEqual([400]);
  });

  it("reads the page count", async () => {
    const source = await createPdf([200, 300, 400, 500]);
    expect(await getPdfPageCount(source)).toBe(4);
  });
});

describe("organizePdf", () => {
  it("reorders pages and rotates selected pages", async () => {
    const source = await createPdf([200, 300, 400]);
    const output = await organizePdf(source, [
      { sourceIndex: 2 },
      { sourceIndex: 0, rotation: 90 },
      { sourceIndex: 1 },
    ]);

    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBe(3);
    expect(document.getPages().map((page) => page.getWidth())).toEqual([400, 200, 300]);
    expect(document.getPage(1).getRotation().angle).toBe(90);
    expect(document.getPage(0).getRotation().angle).toBe(0);
  });

  it("deletes pages by omitting them", async () => {
    const source = await createPdf([200, 300, 400]);
    const output = await organizePdf(source, [
      { sourceIndex: 0 },
      { sourceIndex: 2 },
    ]);
    expect(await pageWidths(output)).toEqual([200, 400]);
  });

  it("rejects an empty page list", async () => {
    const source = await createPdf([200]);
    await expect(organizePdf(source, [])).rejects.toThrow(/at least one/i);
  });

  it("rejects an invalid source page", async () => {
    const source = await createPdf([200]);
    await expect(organizePdf(source, [{ sourceIndex: 2 }])).rejects.toThrow(
      /does not exist/i,
    );
  });
});

describe("rotatePdf", () => {
  it("rotates all pages and preserves the page count", async () => {
    const source = await createPdf([200, 300]);
    const output = await rotatePdf(source, { rotation: 90 });
    const document = await PDFDocument.load(output);

    expect(document.getPageCount()).toBe(2);
    expect(document.getPages().map((page) => page.getRotation().angle)).toEqual([
      90, 90,
    ]);
  });

  it("rotates only selected pages", async () => {
    const source = await createPdf([200, 300]);
    const output = await rotatePdf(source, { rotation: 180, pages: [2] });
    const document = await PDFDocument.load(output);

    expect(document.getPage(0).getRotation().angle).toBe(0);
    expect(document.getPage(1).getRotation().angle).toBe(180);
  });

  it("rejects unsupported angles", async () => {
    const source = await createPdf([200]);
    await expect(
      rotatePdf(source, { rotation: 45 as unknown as 90 }),
    ).rejects.toThrow(/90, 180, or 270/i);
  });
});

describe("deletePdfPages", () => {
  it("removes selected pages and keeps the others", async () => {
    const source = await createPdf([200, 300, 400, 500]);
    const output = await deletePdfPages(source, [1, 3]);
    expect(await pageWidths(output)).toEqual([300, 500]);
  });

  it("refuses to delete every page", async () => {
    const source = await createPdf([200, 300]);
    await expect(deletePdfPages(source, [1, 2])).rejects.toThrow(/every page/i);
  });
});

describe("imagesToPdf", () => {
  it("produces one page per image", async () => {
    const output = await imagesToPdf([
      { name: "one.png", data: ONE_PIXEL_PNG, type: "image/png" },
      { name: "two.jpg", data: createJpeg(), type: "image/jpeg" },
    ]);

    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBe(2);
  });

  it("preserves image aspect ratio with automatic orientation", async () => {
    const output = await imagesToPdf(
      [{ name: "wide.jpg", data: createJpeg(30, 10), type: "image/jpeg" }],
      { pageSize: "a4", orientation: "auto", margin: 24 },
    );

    const document = await PDFDocument.load(output);
    const page = document.getPage(0);
    expect(page.getWidth()).toBeGreaterThan(page.getHeight());
  });

  it("creates fit-to-image pages with margins", async () => {
    const output = await imagesToPdf(
      [{ name: "tiny.png", data: ONE_PIXEL_PNG, type: "image/png" }],
      { pageSize: "fit", margin: 10 },
    );

    const document = await PDFDocument.load(output);
    expect(document.getPage(0).getWidth()).toBe(21);
    expect(document.getPage(0).getHeight()).toBe(21);
  });

  it("rejects unsupported image data", async () => {
    await expect(
      imagesToPdf([
        {
          name: "bad.gif",
          data: new TextEncoder().encode("GIF89a"),
          type: "image/gif",
        },
      ]),
    ).rejects.toThrow(/JPG or PNG/i);
  });
});

describe("page numbers and watermarks", () => {
  it("applies page numbers and returns a valid PDF", async () => {
    const source = await createPdf([200, 300, 400]);
    const output = await addPageNumbers(source, {
      startNumber: 5,
      position: "bottom-center",
      fontSize: 12,
      pages: [1, 3],
    });

    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBe(3);
  });

  it("validates page-number configuration", async () => {
    const source = await createPdf([200]);
    await expect(
      addPageNumbers(source, { startNumber: -1 }),
    ).rejects.toThrow(/whole number/i);
    await expect(
      addPageNumbers(source, { fontSize: 2 }),
    ).rejects.toThrow(/font size/i);
    await expect(
      addPageNumbers(source, { pages: [9] }),
    ).rejects.toThrow(/does not exist/i);
  });

  it("applies a text watermark and returns a valid PDF", async () => {
    const source = await createPdf([200, 300]);
    const output = await addTextWatermark(source, {
      text: "CONFIDENTIAL",
      opacity: 0.2,
      fontSize: 48,
      rotation: 45,
      placement: "diagonal",
    });

    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBe(2);
  });

  it("validates watermark configuration", async () => {
    const source = await createPdf([200]);
    await expect(addTextWatermark(source, { text: "  " })).rejects.toThrow(
      /watermark text/i,
    );
    await expect(
      addTextWatermark(source, { text: "Draft", opacity: 2 }),
    ).rejects.toThrow(/opacity/i);
    await expect(
      addTextWatermark(source, { text: "Draft", fontSize: 400 }),
    ).rejects.toThrow(/font size/i);
    await expect(
      addTextWatermark(source, { text: "Draft", pages: [9] }),
    ).rejects.toThrow(/does not exist/i);
  });
});
