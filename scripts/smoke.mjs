import { chromium } from "playwright-core";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { encode as encodeJpeg } from "jpeg-js";
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

async function downloadResult(page, expectedPages) {
  const downloadPromise = page.waitForEvent("download", { timeout: 30000 });
  await page.getByRole("button", { name: "Download", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  const bytes = new Uint8Array(await readFile(path));
  const document = await PDFDocument.load(bytes);
  assert(
    document.getPageCount() === expectedPages,
    `Expected ${expectedPages} pages, got ${document.getPageCount()} (${download.suggestedFilename()})`,
  );
  return download.suggestedFilename();
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

  try {
    // Home page + search
    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /Every PDF tool/i }).waitFor();
    const toolLinks = await page.locator('a[href^="/tools/"]').count();
    assert(toolLinks >= 9, `Expected tool cards, found ${toolLinks}`);
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
    const mergedName = await downloadResult(page, 5);
    console.log("merge: ok", mergedName);

    // Split
    await openTool(page, "split-pdf", "Split PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Pages to extract").fill("1,3");
    await page.getByRole("button", { name: "Split PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const splitName = await downloadResult(page, 2);
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
    const organizedName = await downloadResult(page, 2);
    console.log("organize: ok", organizedName);

    // Rotate
    await openTool(page, "rotate-pdf", "Rotate PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.locator("#rotate-target").selectOption("selected");
    await page.getByLabel("Pages to rotate").fill("2");
    await page.getByRole("button", { name: "Rotate PDF" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const rotatedName = await downloadResult(page, 3);
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
    const imagesName = await downloadResult(page, 2);
    console.log("image-to-pdf: ok", imagesName);

    // Delete pages
    await openTool(page, "delete-pages", "Delete PDF Pages");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Pages to delete").fill("2");
    await page.getByRole("button", { name: "Delete pages" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const deletedName = await downloadResult(page, 2);
    console.log("delete-pages: ok", deletedName);

    // Extract pages
    await openTool(page, "extract-pages", "Extract PDF Pages");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Pages to extract").fill("3,1");
    await page.getByRole("button", { name: "Extract pages" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const extractedName = await downloadResult(page, 2);
    console.log("extract-pages: ok", extractedName);

    // Page numbers
    await openTool(page, "add-page-numbers", "Add Page Numbers");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Starting number").fill("5");
    await page.getByRole("button", { name: "Add page numbers" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const numberedName = await downloadResult(page, 3);
    console.log("add-page-numbers: ok", numberedName);

    // Watermark
    await openTool(page, "watermark-pdf", "Watermark PDF");
    await uploadPdf(page, pdf3);
    await page.getByText("3 pages detected").waitFor();
    await page.getByLabel("Watermark text").fill("SMOKE TEST");
    await page.getByRole("button", { name: "Apply watermark" }).click();
    await page.getByText("Your PDF is ready").waitFor({ timeout: 30000 });
    const watermarkName = await downloadResult(page, 3);
    console.log("watermark: ok", watermarkName);

    // Unavailable tool honesty
    await page.goto(`${BASE}/tools/protect-pdf`, { waitUntil: "networkidle" });
    await page.getByText("This feature is intentionally not shipped.").waitFor();
    assert(
      (await page.locator('input[type="file"]').count()) === 0,
      "Unavailable tool must not show a file input",
    );
    console.log("protect-pdf limitation: ok");

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
