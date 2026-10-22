import { describe, expect, it } from "vitest";
import { PDFDocument } from "@cantoo/pdf-lib";
import { createPdf } from "./helpers";
import { reversePdf } from "@/lib/pdf/reverse";
import { addBlankPages } from "@/lib/pdf/blank-pages";
import { readPdfMetadata, writePdfMetadata } from "@/lib/pdf/metadata";
import { flattenPdf } from "@/lib/pdf/flatten";
import { unlockPdf } from "@/lib/pdf/unlock";
import { protectPdf } from "@/lib/pdf/protect";
import { parseCsv } from "@/lib/csv";
import { textToPdf, wrapParagraph } from "@/lib/pdf/text-to-pdf";
import { csvToPdf } from "@/lib/pdf/csv-to-pdf";
import { textPagesToMarkdown } from "@/lib/pdf/text-layout";

async function pageWidths(bytes: Uint8Array): Promise<number[]> {
  const document = await PDFDocument.load(bytes);
  return document.getPages().map((page) => page.getWidth());
}

describe("reversePdf", () => {
  it("reverses the page order", async () => {
    const source = await createPdf([200, 300, 400]);
    const output = await reversePdf(source);
    expect(await pageWidths(output)).toEqual([400, 300, 200]);
  });
});

describe("addBlankPages", () => {
  it("appends blank pages that match the first page", async () => {
    const source = await createPdf([200, 300]);
    const output = await addBlankPages(source, { count: 2, position: "end" });
    const document = await PDFDocument.load(output);

    expect(document.getPageCount()).toBe(4);
    expect(await pageWidths(output)).toEqual([200, 300, 200, 200]);
  });

  it("inserts A4 pages at the start", async () => {
    const source = await createPdf([200, 300]);
    const output = await addBlankPages(source, {
      count: 1,
      position: "start",
      size: "a4",
    });
    const document = await PDFDocument.load(output);

    expect(document.getPageCount()).toBe(3);
    expect(document.getPage(0).getWidth()).toBeCloseTo(595.28, 1);
    expect(document.getPage(1).getWidth()).toBe(200);
  });

  it("rejects an invalid blank-page count", async () => {
    const source = await createPdf([200]);
    await expect(addBlankPages(source, { count: 0 })).rejects.toThrow(
      /between 1 and 50/i,
    );
  });
});

describe("PDF metadata", () => {
  it("writes and reads document properties", async () => {
    const source = await createPdf([200]);
    const output = await writePdfMetadata(source, {
      title: "Quarterly report",
      author: "ARS",
      subject: "Smoke",
      keywords: ["finance", "2026"],
      creator: "ArsPDF test",
    });

    const metadata = await readPdfMetadata(output);
    expect(metadata.title).toBe("Quarterly report");
    expect(metadata.author).toBe("ARS");
    expect(metadata.subject).toBe("Smoke");
    expect(metadata.keywords).toEqual(["finance", "2026"]);
    expect(metadata.creator).toBe("ArsPDF test");
  });

  it("clears document properties", async () => {
    const source = await createPdf([200]);
    const written = await writePdfMetadata(source, { title: "Temp", author: "Someone" });
    const cleared = await writePdfMetadata(written, { clear: true });

    const metadata = await readPdfMetadata(cleared);
    expect(metadata.title).toBe("");
    expect(metadata.author).toBe("");
    expect(metadata.keywords).toEqual([]);
  });
});

describe("flattenPdf", () => {
  it("returns a valid PDF and preserves the page count", async () => {
    const source = await createPdf([200, 300]);
    const output = await flattenPdf(source, { forms: true, annotations: true });
    const document = await PDFDocument.load(output);

    expect(document.getPageCount()).toBe(2);
  });

  it("requires at least one option", async () => {
    const source = await createPdf([200]);
    await expect(
      flattenPdf(source, { forms: false, annotations: false }),
    ).rejects.toThrow(/at least one/i);
  });
});

describe("unlockPdf", () => {
  it("removes encryption when the password is correct", async () => {
    const source = await createPdf([200, 300]);
    const encrypted = await protectPdf(source, { userPassword: "secret" });

    let locked = false;
    try {
      await PDFDocument.load(encrypted);
    } catch {
      locked = true;
    }
    expect(locked).toBe(true);

    const unlocked = await unlockPdf(encrypted, "secret");
    const document = await PDFDocument.load(unlocked);
    expect(document.getPageCount()).toBe(2);
  });

  it("rejects an incorrect password", async () => {
    const source = await createPdf([200]);
    const encrypted = await protectPdf(source, { userPassword: "secret" });

    await expect(unlockPdf(encrypted, "wrong")).rejects.toThrow(/did not unlock/i);
  });
});

describe("parseCsv", () => {
  it("parses quoted fields, escaped quotes, and CRLF rows", () => {
    const rows = parseCsv('Name,Note\r\nAlpha,"Hello, world"\r\nBeta,"Say ""hi"""');
    expect(rows).toEqual([
      ["Name", "Note"],
      ["Alpha", "Hello, world"],
      ["Beta", 'Say "hi"'],
    ]);
  });

  it("keeps line breaks inside quoted fields", () => {
    const rows = parseCsv('id,text\n1,"line one\nline two"');
    expect(rows[1]?.[1]).toBe("line one\nline two");
  });

  it("drops empty rows", () => {
    expect(parseCsv("\n\n")).toEqual([]);
  });
});

describe("textToPdf", () => {
  it("wraps text to the requested width", () => {
    const measure = (value: string) => value.length;
    expect(wrapParagraph("hello world", measure, 5)).toEqual(["hello", "world"]);
    expect(wrapParagraph("abcdefgh", measure, 3)).toEqual(["abc", "def", "gh"]);
  });

  it("creates a valid one-page PDF", async () => {
    const output = await textToPdf("Hello from ArsPDF");
    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBe(1);
  });

  it("paginates long text", async () => {
    const longText = Array.from({ length: 400 }, (_, index) => `Line ${index}`).join("\n");
    const output = await textToPdf(longText, { fontSize: 12 });
    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBeGreaterThan(1);
  });

  it("rejects empty text", async () => {
    await expect(textToPdf("   ")).rejects.toThrow(/add some text/i);
  });
});

describe("csvToPdf", () => {
  it("renders rows into a valid PDF", async () => {
    const output = await csvToPdf("Name,Amount\nAlpha,12\nBeta,34", {
      headerRow: true,
    });
    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("rejects empty CSV input", async () => {
    await expect(csvToPdf("   \n  ")).rejects.toThrow(/does not contain any rows/i);
  });
});

describe("textPagesToMarkdown", () => {
  it("creates page headings and bullet lists", () => {
    const markdown = textPagesToMarkdown([
      {
        pageNumber: 1,
        text: "Hello\n• First item",
        lines: [
          { y: 10, text: "Hello", cells: ["Hello"] },
          { y: 5, text: "• First item", cells: ["• First item"] },
        ],
      },
    ]);

    expect(markdown).toContain("# Page 1");
    expect(markdown).toContain("Hello");
    expect(markdown).toContain("- First item");
  });
});
