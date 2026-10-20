import { createRequire } from "node:module";
import { copyFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const packageJson = require.resolve("pdfjs-dist/package.json");
const source = join(dirname(packageJson), "build", "pdf.worker.min.mjs");
const destinationDirectory = join(process.cwd(), "public");
const destination = join(destinationDirectory, "pdf.worker.min.mjs");

if (!existsSync(source)) {
  console.error(`[arspdf] Could not find the PDF.js worker at ${source}`);
  process.exit(1);
}

mkdirSync(destinationDirectory, { recursive: true });
copyFileSync(source, destination);

const size = Math.round(statSync(destination).size / 1024);
console.log(`[arspdf] Copied PDF.js worker to public/pdf.worker.min.mjs (${size} KB)`);
