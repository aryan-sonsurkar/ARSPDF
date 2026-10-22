import { chromium } from "playwright-core";
import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";
import { encode as encodeJpeg } from "jpeg-js";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";

const BASE = process.env.ARSPDF_BASE_URL ?? "http://localhost:3100";
const consoleErrors = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function makePdf(pageCount) {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (let index = 0; index < pageCount; index += 1) {
    const page = document.addPage([300, 420]);
    page.drawText(`Page ${index + 1}`, {
      x: 24,
      y: 380,
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  }
  return Buffer.from(await document.save());
}

function makeJpeg() {
  const width = 24;
  const height = 16;
  const data = Buffer.alloc(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    data[index * 4] = 180;
    data[index * 4 + 1] = 90;
    data[index * 4 + 2] = 220;
    data[index * 4 + 3] = 255;
  }
  return Buffer.from(encodeJpeg({ width, height, data }, 80).data);
}

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
  "base64",
);

async function downloadResult(page) {
  const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  return {
    bytes: new Uint8Array(await readFile(path)),
    filename: download.suggestedFilename(),
  };
}

async function downloadPdfResult(page, expectedPages) {
  const result = await downloadResult(page);
  const document = await PDFDocument.load(result.bytes);
  assert(
    document.getPageCount() === expectedPages,
    `Expected ${expectedPages} pages, got ${document.getPageCount()} (${result.filename})`,
  );
  return result.filename;
}

async function makeDocx(text) {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
  );
  zip.file(
    "word/document.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:rPr><w:b/></w:rPr><w:t>Smoke DOCX heading</w:t></w:r></w:p><w:p><w:r><w:t>Second paragraph for conversion.</w:t></w:r></w:p><w:sectPr/></w:body></w:document>`,
  );
  return Buffer.from(await zip.generateAsync({ type: "uint8array" }));
}

async function makeXlsx() {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  );
  zip.file(
    "xl/workbook.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets></workbook>`,
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
  );
  zip.file(
    "xl/worksheets/sheet1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>Name</t></is></c><c r="B1" t="inlineStr"><is><t>Amount</t></is></c></row><row r="2"><c r="A2" t="inlineStr"><is><t>Alpha</t></is></c><c r="B2" t="inlineStr"><is><t>12</t></is></c></row></sheetData></worksheet>`,
  );
  return Buffer.from(await zip.generateAsync({ type: "uint8array" }));
}

async function makePptx() {
  const zip = new JSZip();
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/></Types>`,
  );
  zip.file(
    "_rels/.rels",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`,
  );
  zip.file(
    "ppt/slides/slide1.xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:sp><p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:t>Smoke Slide Title</a:t></a:r></a:p><a:p><a:r><a:t>First bullet text.</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld></p:sld>`,
  );
  return Buffer.from(await zip.generateAsync({ type: "uint8array" }));
}

async function downloadConvertedPdf(page) {
  const result = await downloadResult(page);
  const document = await PDFDocument.load(result.bytes);
  assert(
    document.getPageCount() >= 1,
    `Expected at least one page in ${result.filename}`,
  );
  return { filename: result.filename, pages: document.getPageCount() };
}

async function openTool(page, slug, title) {
  await page.goto(`${BASE}/tools/${slug}`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: title, level: 1 }).waitFor({ timeout: 30000 });
}

async function uploadPdf(page, buffer, name = "sample.pdf") {
  await page.locator('input[type="file"]').setInputFiles({
    name,
    mimeType: "application/pdf",
    buffer,
  });
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  const pdf3 = await makePdf(3);
  const pdf2 = await makePdf(2);
  const jpeg = makeJpeg();
  const docx = await makeDocx();
  const xlsx = await makeXlsx();
  const pptx = await makePptx();
  const csv = Buffer.from("Name,Amount\nAlpha,12\nBeta,34");

  try {
    // Home page + search
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /Every PDF tool/i }).waitFor();
    const toolLinks = await page.locator('a[href^="/tools/"]').count();
    assert(toolLinks >= 30, `Expected 30 tool cards, found ${toolLinks}`);
    await page.getByLabel("Search PDF tools").fill("water");
    await page.getByRole("heading", { name: "Watermark PDF" }).waitFor();
    assert(
      (await page.title()) === "ArsPDF — Every PDF tool. No paywalls.",
      `Unexpected home title: ${await page.title()}`,
    );
    assert(
      Boolean(await page.locator('meta[name="description"]').getAttribute("content")),
      "Home page is missing a meta description",
    );

    const robots = await page.request.get(`${BASE}/robots.txt`);
    assert(robots.ok() && (await robots.text()).includes("Allow: /"), "robots.txt is invalid");
    const sitemap = await page.request.get(`${BASE}/sitemap.xml`);
    assert(sitemap.ok(), "sitemap.xml did not return 200");
    const ogImage = await page.request.get(`${BASE}/og.png`);
    assert(
      ogImage.ok() && ogImage.headers()["content-type"]?.includes("image/png"),
      "Open Graph image is missing",
    );
    console.log("home + metadata: ok");

    // Merge
    await openTool(page, "merge-pdf", "Merge PDF");
    await page.locator('input[type="file"]').setInputFiles([
      { name: "first.pdf", mimeType: "application/pdf", buffer: pdf2 },
      { name: "second.pdf", mimeType: "application/pdf", buffer: pdf3 },
    ]);
    await page.getByText("2 files will be combined in the order above.").waitFor();
    await page.getByRole("button", { name: "Merge PDFs" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const mergedName = await downloadPdfResult(page, 5);
    console.log("merge: ok", mergedName);

    // Split
    await openTool(page, "split-pdf", "Split PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Pages to extract").fill("1,3");
    await page.getByRole("button", { name: "Split PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const splitName = await downloadPdfResult(page, 2);
    console.log("split: ok", splitName);

    // Organize (PDF.js thumbnails + worker)
    await openTool(page, "organize-pdf", "Organize PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("Page order").waitFor({ timeout: 30000 });
    await page.waitForFunction(
      () => {
        const canvases = Array.from(document.querySelectorAll("canvas"));
        return canvases.length >= 3 && canvases.every((canvas) => canvas.width > 0);
      },
      { timeout: 30000 },
    );
    await page.getByRole("button", { name: "Rotate page 1 90 degrees" }).click();
    await page.getByText("90°", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Delete page 3" }).click();
    await page.getByRole("button", { name: "Apply changes" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const organizedName = await downloadPdfResult(page, 2);
    console.log("organize: ok", organizedName);

    // Rotate
    await openTool(page, "rotate-pdf", "Rotate PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.locator("#rotate-target").selectOption("selected");
    await page.getByLabel("Pages to rotate").fill("2");
    await page.getByRole("button", { name: "Rotate PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const rotatedName = await downloadPdfResult(page, 3);
    console.log("rotate: ok", rotatedName);

    // Image to PDF
    await openTool(page, "image-to-pdf", "Image to PDF");
    await page.locator('input[type="file"]').setInputFiles([
      { name: "one.png", mimeType: "image/png", buffer: PNG },
      { name: "two.jpg", mimeType: "image/jpeg", buffer: jpeg },
    ]);
    await page.getByText("2 images → 2 PDF pages.").waitFor();
    await page.getByRole("button", { name: "Create PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const imagesName = await downloadPdfResult(page, 2);
    console.log("image-to-pdf: ok", imagesName);

    // Delete pages
    await openTool(page, "delete-pages", "Delete PDF Pages");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Pages to delete").fill("2");
    await page.getByRole("button", { name: "Delete pages" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const deletedName = await downloadPdfResult(page, 2);
    console.log("delete-pages: ok", deletedName);

    // Extract pages
    await openTool(page, "extract-pages", "Extract PDF Pages");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Pages to extract").fill("3,1");
    await page.getByRole("button", { name: "Extract pages" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const extractedName = await downloadPdfResult(page, 2);
    console.log("extract-pages: ok", extractedName);

    // Page numbers
    await openTool(page, "add-page-numbers", "Add Page Numbers");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Starting number").fill("5");
    await page.getByRole("button", { name: "Add page numbers" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const numberedName = await downloadPdfResult(page, 3);
    console.log("add-page-numbers: ok", numberedName);

    // Watermark
    await openTool(page, "watermark-pdf", "Watermark PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Watermark text").fill("SMOKE TEST");
    await page.getByRole("button", { name: "Apply watermark" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const watermarkName = await downloadPdfResult(page, 3);
    console.log("watermark: ok", watermarkName);

    // Protect
    await openTool(page, "protect-pdf", "Protect PDF");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.locator("#protect-password").fill("smoke-pass");
    await page.locator("#protect-confirmation").fill("smoke-pass");
    await page.getByRole("button", { name: "Protect PDF" }).click();
    await page.getByText("Your protected PDF is ready").waitFor({ timeout: 60000 });
    const protectedResult = await downloadResult(page);
    let protectedLocked = false;
    try {
      await PDFDocument.load(protectedResult.bytes);
    } catch {
      protectedLocked = true;
    }
    assert(protectedLocked, "Protected PDF should require a password");
    const unlocked = await PDFDocument.load(protectedResult.bytes, {
      password: "smoke-pass",
    });
    assert(unlocked.getPageCount() === 2, "Protected PDF lost pages");
    console.log("protect: ok", protectedResult.filename);

    // Crop
    await openTool(page, "crop-pdf", "Crop PDF");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Crop PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 60000 });
    const croppedResult = await downloadResult(page);
    const croppedDocument = await PDFDocument.load(croppedResult.bytes);
    const croppedBox = croppedDocument.getPage(0).getMediaBox();
    assert(croppedBox.width < 300, `Expected a cropped width, got ${croppedBox.width}`);
    console.log("crop: ok", croppedResult.filename);

    // Compress (lossless)
    await openTool(page, "compress-pdf", "Compress PDF");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Compress PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 60000 });
    const compressedName = await downloadPdfResult(page, 2);
    console.log("compress: ok", compressedName);

    // Repair
    await openTool(page, "repair-pdf", "Repair PDF");
    await uploadPdf(page, pdf2);
    await page.getByRole("button", { name: "Repair PDF" }).click();
    await page.getByText("Your repaired PDF is ready").waitFor({ timeout: 60000 });
    const repairedName = await downloadPdfResult(page, 2);
    console.log("repair: ok", repairedName);

    // PDF to JPG
    await openTool(page, "pdf-to-jpg", "PDF to JPG");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Export JPG" }).click();
    await page.getByText("Your JPG images are ready").waitFor({ timeout: 60000 });
    const jpgZip = await downloadResult(page);
    assert(jpgZip.filename.endsWith(".zip"), `Expected a ZIP, got ${jpgZip.filename}`);
    const jpgArchive = await JSZip.loadAsync(jpgZip.bytes);
    assert(
      Object.keys(jpgArchive.files).length === 2,
      "Expected two JPG entries in the ZIP",
    );
    console.log("pdf-to-jpg: ok", jpgZip.filename);

    // PDF to PNG
    await openTool(page, "pdf-to-png", "PDF to PNG");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Export PNG" }).click();
    await page.getByText("Your PNG images are ready").waitFor({ timeout: 60000 });
    const pngZip = await downloadResult(page);
    const pngArchive = await JSZip.loadAsync(pngZip.bytes);
    assert(
      Object.keys(pngArchive.files).length === 2,
      "Expected two PNG entries in the ZIP",
    );
    console.log("pdf-to-png: ok", pngZip.filename);

    // PDF to text
    await openTool(page, "pdf-to-text", "Extract PDF Text");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByRole("button", { name: "Extract text" }).click();
    await page.getByText("Your text file is ready").waitFor({ timeout: 60000 });
    const textResult = await downloadResult(page);
    const extractedText = Buffer.from(textResult.bytes).toString("utf8");
    assert(extractedText.includes("Page 1"), "TXT is missing extracted text");
    console.log("pdf-to-text: ok", textResult.filename);

    // PDF to Word
    await openTool(page, "pdf-to-word", "PDF to Word");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Create DOCX" }).click();
    await page.getByText("Your Word document is ready").waitFor({ timeout: 60000 });
    const wordResult = await downloadResult(page);
    const wordArchive = await JSZip.loadAsync(wordResult.bytes);
    const wordXml = await wordArchive.file("word/document.xml")?.async("string");
    assert(wordXml?.includes("Page 1"), "DOCX is missing extracted text");
    console.log("pdf-to-word: ok", wordResult.filename);

    // PDF to Excel
    await openTool(page, "pdf-to-excel", "PDF to Excel");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Create XLSX" }).click();
    await page.getByText("Your spreadsheet is ready").waitFor({ timeout: 60000 });
    const excelResult = await downloadResult(page);
    const excelArchive = await JSZip.loadAsync(excelResult.bytes);
    const excelXml = await excelArchive.file("xl/worksheets/sheet1.xml")?.async("string");
    assert(excelXml?.includes("Page 1"), "XLSX is missing extracted text");
    console.log("pdf-to-excel: ok", excelResult.filename);

    // Word to PDF
    await openTool(page, "word-to-pdf", "Word to PDF");
    await page.locator('input[type="file"]').setInputFiles({
      name: "smoke.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      buffer: docx,
    });
    await page.getByRole("button", { name: "Convert to PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 60000 });
    const wordPdf = await downloadConvertedPdf(page);
    console.log("word-to-pdf: ok", wordPdf.filename);

    // Excel to PDF
    await openTool(page, "excel-to-pdf", "Excel to PDF");
    await page.locator('input[type="file"]').setInputFiles({
      name: "smoke.xlsx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: xlsx,
    });
    await page.getByRole("button", { name: "Convert to PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 60000 });
    const excelPdf = await downloadConvertedPdf(page);
    console.log("excel-to-pdf: ok", excelPdf.filename);

    // PowerPoint to PDF
    await openTool(page, "powerpoint-to-pdf", "PowerPoint to PDF");
    await page.locator('input[type="file"]').setInputFiles({
      name: "smoke.pptx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      buffer: pptx,
    });
    await page.getByRole("button", { name: "Convert to PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 60000 });
    const pptxPdf = await downloadConvertedPdf(page);
    console.log("powerpoint-to-pdf: ok", pptxPdf.filename);

    // Reverse
    await openTool(page, "reverse-pdf", "Reverse PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByRole("button", { name: "Reverse PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const reversedName = await downloadPdfResult(page, 3);
    console.log("reverse: ok", reversedName);

    // Add blank pages
    await openTool(page, "add-blank-pages", "Add Blank Pages");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.locator("#blank-count").fill("2");
    await page.getByRole("button", { name: "Add blank pages" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const blankPagesName = await downloadPdfResult(page, 4);
    console.log("add-blank-pages: ok", blankPagesName);

    // Flatten
    await openTool(page, "flatten-pdf", "Flatten PDF");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Flatten PDF" }).click();
    await page.getByText("Your flattened PDF is ready").waitFor({ timeout: 30000 });
    const flattenedName = await downloadPdfResult(page, 2);
    console.log("flatten-pdf: ok", flattenedName);

    // Edit metadata
    await openTool(page, "edit-metadata", "Edit PDF Metadata");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.waitForTimeout(400);
    await page.locator("#meta-title").fill("Smoke Metadata Title");
    await page.getByRole("button", { name: "Save metadata" }).click();
    await page.getByText("Your updated PDF is ready").waitFor({ timeout: 30000 });
    const metadataResult = await downloadResult(page);
    const metadataDocument = await PDFDocument.load(metadataResult.bytes);
    assert(
      metadataDocument.getTitle() === "Smoke Metadata Title",
      `Unexpected metadata title: ${metadataDocument.getTitle()}`,
    );
    console.log("edit-metadata: ok", metadataResult.filename);

    // Grayscale
    await openTool(page, "grayscale-pdf", "Grayscale PDF");
    await uploadPdf(page, pdf2);
    await page.getByText("2 pages detected").waitFor();
    await page.getByRole("button", { name: "Convert to grayscale" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 60000 });
    const grayscaleName = await downloadPdfResult(page, 2);
    console.log("grayscale-pdf: ok", grayscaleName);

    // Text to PDF
    await openTool(page, "text-to-pdf", "Text to PDF");
    await page
      .locator("#text-source")
      .fill("Smoke test text for a generated PDF.");
    await page.getByRole("button", { name: "Create PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const textPdfName = await downloadPdfResult(page, 1);
    console.log("text-to-pdf: ok", textPdfName);

    // CSV to PDF
    await openTool(page, "csv-to-pdf", "CSV to PDF");
    await page.locator('input[type="file"]').setInputFiles({
      name: "smoke.csv",
      mimeType: "text/csv",
      buffer: csv,
    });
    await page.getByText(/across 2 columns/).waitFor({ timeout: 30000 });
    await page.getByRole("button", { name: "Create PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const csvPdfName = await downloadPdfResult(page, 1);
    console.log("csv-to-pdf: ok", csvPdfName);

    // PDF to Markdown
    await openTool(page, "pdf-to-markdown", "PDF to Markdown");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByRole("button", { name: "Create Markdown" }).click();
    await page.getByText("Your Markdown file is ready").waitFor({ timeout: 30000 });
    const markdownResult = await downloadResult(page);
    const markdownText = Buffer.from(markdownResult.bytes).toString("utf8");
    assert(
      markdownText.includes("# Page 1"),
      "Markdown output is missing the page heading",
    );
    console.log("pdf-to-markdown: ok", markdownResult.filename);

    // Unlock (reuses the PDF encrypted earlier by Protect)
    await openTool(page, "unlock-pdf", "Unlock PDF");
    await page.locator('input[type="file"]').setInputFiles({
      name: "protected.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from(protectedResult.bytes),
    });
    await page.locator("#unlock-password").fill("smoke-pass");
    await page.getByRole("button", { name: "Unlock PDF" }).click();
    await page.getByText("Your unlocked PDF is ready").waitFor({ timeout: 30000 });
    const unlockedResult = await downloadResult(page);
    const unlockedDocument = await PDFDocument.load(unlockedResult.bytes);
    assert(unlockedDocument.getPageCount() === 2, "Unlocked PDF lost pages");
    console.log("unlock: ok", unlockedResult.filename);

    // Invalid file handling on split
    await openTool(page, "split-pdf", "Split PDF");
    await page.locator('input[type="file"]').setInputFiles({
      name: "broken.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("not a real pdf"),
    });
    await page.getByText("does not appear to be a valid PDF").waitFor({ timeout: 30000 });
    console.log("invalid PDF handling: ok");
  } finally {
    await browser.close();
  }

  const unexpectedErrors = consoleErrors.filter(
    (text) =>
      !text.includes("Failed to load resource") &&
      !text.includes("Download the React DevTools"),
  );

  if (unexpectedErrors.length > 0) {
    console.log("Console errors:", unexpectedErrors);
  }

  console.log(
    `Smoke test finished. ${unexpectedErrors.length} unexpected console error(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
