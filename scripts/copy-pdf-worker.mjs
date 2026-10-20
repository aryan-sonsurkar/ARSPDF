import { createRequire } from "node:module";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const pdfjsRoot = dirname(require.resolve("pdfjs-dist/package.json"));
const workerSource = join(pdfjsRoot, "build", "pdf.worker.min.mjs");
const publicDirectory = join(process.cwd(), "public");
const workerDestination = join(publicDirectory, "pdf.worker.min.mjs");

if (!existsSync(workerSource)) {
  console.error(`[arspdf] Could not find the PDF.js worker at ${workerSource}`);
  process.exit(1);
}

mkdirSync(publicDirectory, { recursive: true });
copyFileSync(workerSource, workerDestination);

const workerSize = Math.round(statSync(workerDestination).size / 1024);
console.log(
  `[arspdf] Copied PDF.js worker to public/pdf.worker.min.mjs (${workerSize} KB)`,
);

for (const assetDirectory of ["standard_fonts", "cmaps"]) {
  const source = join(pdfjsRoot, assetDirectory);
  const destination = join(publicDirectory, "pdfjs", assetDirectory);

  if (!existsSync(source)) {
    console.error(`[arspdf] Could not find PDF.js assets at ${source}`);
    process.exit(1);
  }

  rmSync(destination, { recursive: true, force: true });
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
  console.log(`[arspdf] Copied PDF.js ${assetDirectory} to public/pdfjs/${assetDirectory}`);
}
