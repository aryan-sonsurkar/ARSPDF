import { describe, expect, it } from "vitest";
import JSZip from "jszip";
import { PDFDocument } from "@cantoo/pdf-lib";
import { createPdf } from "./helpers";
import { compressPdf } from "@/lib/pdf/compress";
import { cropPdf } from "@/lib/pdf/crop";
import { protectPdf } from "@/lib/pdf/protect";
import { repairPdf } from "@/lib/pdf/repair";
import {
  buildPdfTextPage,
  groupTextItems,
  textPagesToPlainText,
} from "@/lib/pdf/text-layout";
import { createTextDocx } from "@/lib/office/docx-writer";
import { writeXlsx } from "@/lib/office/xlsx-writer";

describe("cropPdf", () => {
  it("applies margins to selected pages only", async () => {
    const source = await createPdf([200, 300]);
    const output = await cropPdf(source, {
      margins: { top: 10, right: 20, bottom: 30, left: 40 },
      pages: [1],
    });

    const document = await PDFDocument.load(output);
    const first = document.getPage(0).getMediaBox();
    const second = document.getPage(1).getMediaBox();

    expect(first.width).toBeCloseTo(140);
    expect(first.height).toBeCloseTo(240);
    expect(first.x).toBeCloseTo(40);
    expect(first.y).toBeCloseTo(30);
    expect(second.width).toBeCloseTo(300);
  });

  it("rejects empty and oversized margins", async () => {
    const source = await createPdf([200]);
    await expect(
      cropPdf(source, { margins: { top: 0, right: 0, bottom: 0, left: 0 } }),
    ).rejects.toThrow(/greater than zero/i);
    await expect(
      cropPdf(source, { margins: { top: 500, right: 0, bottom: 0, left: 0 } }),
    ).rejects.toThrow(/too large/i);
  });
});

describe("protectPdf", () => {
  it("encrypts a PDF that requires the user password", async () => {
    const source = await createPdf([200, 300]);
    const encrypted = await protectPdf(source, { userPassword: "secret" });

    await expect(PDFDocument.load(encrypted)).rejects.toThrow();

    const unlocked = await PDFDocument.load(encrypted, { password: "secret" });
    expect(unlocked.getPageCount()).toBe(2);
  });

  it("requires a password of at least four characters", async () => {
    const source = await createPdf([200]);
    await expect(protectPdf(source, { userPassword: "abc" })).rejects.toThrow(
      /at least 4/i,
    );
  });
});

describe("repairPdf", () => {
  it("normalizes a readable PDF without changing its pages", async () => {
    const source = await createPdf([200, 300]);
    const result = await repairPdf(source);

    expect(result.mode).toBe("normalized");
    const document = await PDFDocument.load(result.bytes);
    expect(document.getPageCount()).toBe(2);
  });

  it("recovers a PDF with leading garbage before the header", async () => {
    const source = await createPdf([200]);
    const corrupted = new Uint8Array(source.length + 8);
    corrupted.set([1, 2, 3, 4, 5, 6, 7, 8]);
    corrupted.set(source, 8);

    const result = await repairPdf(corrupted);
    const document = await PDFDocument.load(result.bytes);
    expect(document.getPageCount()).toBe(1);
  });
});

describe("compressPdf", () => {
  it("keeps pages when re-saving losslessly", async () => {
    const source = await createPdf([200, 300]);
    const output = await compressPdf(source, { mode: "lossless" });
    const document = await PDFDocument.load(output);
    expect(document.getPageCount()).toBe(2);
  });
});

describe("text layout", () => {
  it("groups items into lines and cells by position", () => {
    const lines = groupTextItems([
      { text: "Name", x: 10, y: 100, width: 24, height: 10 },
      { text: "Amount", x: 100, y: 100, width: 34, height: 10 },
      { text: "Alpha", x: 10, y: 80, width: 26, height: 10 },
      { text: "12", x: 38, y: 80, width: 8, height: 10 },
      { text: "50", x: 100, y: 80, width: 10, height: 10 },
    ]);

    expect(lines).toHaveLength(2);
    expect(lines[0]?.cells).toEqual(["Name", "Amount"]);
    expect(lines[1]?.cells).toEqual(["Alpha 12", "50"]);
  });

  it("keeps close items in one cell and writes page text", () => {
    const page = buildPdfTextPage(2, [
      { text: "Total", x: 10, y: 50, width: 20, height: 10 },
      { text: "$9", x: 32, y: 50, width: 10, height: 10 },
    ]);

    expect(page.lines).toHaveLength(1);
    expect(page.lines[0]?.cells).toEqual(["Total $9"]);
    expect(textPagesToPlainText([page])).toContain("--- Page 2 ---");
    expect(textPagesToPlainText([page])).toContain("Total $9");
  });
});

describe("office writers", () => {
  it("creates a DOCX with escaped text and page breaks", async () => {
    const bytes = await createTextDocx([
      { lines: ["Hello & <world>"] },
      { lines: ["Second page"] },
    ]);
    const zip = await JSZip.loadAsync(bytes);
    const xml = await zip.file("word/document.xml")?.async("string");

    expect(xml).toContain("Hello &amp; &lt;world&gt;");
    expect(xml).toContain('w:type="page"');
    expect(xml).toContain("Second page");
  });

  it("creates an XLSX with inline string cells", async () => {
    const bytes = await writeXlsx([
      {
        name: "Page 1",
        rows: [
          ["Name", "Amount"],
          ["Alpha", "12"],
        ],
      },
    ]);
    const zip = await JSZip.loadAsync(bytes);
    const sheet = await zip.file("xl/worksheets/sheet1.xml")?.async("string");

    expect(sheet).toContain('t="inlineStr"');
    expect(sheet).toContain("Name");
    expect(sheet).toContain("Alpha");
    expect(zip.file("xl/workbook.xml")).not.toBeNull();
  });
});
