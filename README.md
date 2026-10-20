# ArsPDF

**Every PDF tool. No paywalls.**

ArsPDF is a free, browser-first PDF toolkit. It is built as a production-quality portfolio project: a small set of document tools that actually work, an honest feature list, and no account, subscription, database, or AI dependency.

The core processing model is local. PDFs are read and written in the browser with [pdf-lib](https://pdf-lib.js.org/), and page previews are rendered with [PDF.js](https://mozilla.github.io/pdf.js/). There are no API routes that accept document uploads.

## Feature status

| Tool | Route | Status |
| --- | --- | --- |
| Merge PDF | `/tools/merge-pdf` | Implemented |
| Split PDF | `/tools/split-pdf` | Implemented |
| Organize PDF | `/tools/organize-pdf` | Implemented |
| Rotate PDF | `/tools/rotate-pdf` | Implemented |
| Image to PDF | `/tools/image-to-pdf` | Implemented |
| Delete PDF Pages | `/tools/delete-pages` | Implemented |
| Extract PDF Pages | `/tools/extract-pages` | Implemented |
| Add Page Numbers | `/tools/add-page-numbers` | Implemented |
| Watermark PDF | `/tools/watermark-pdf` | Implemented |
| Protect PDF | `/tools/protect-pdf` | Unavailable |
| Compress PDF | `/tools/compress-pdf` | Coming soon |
| PDF to JPG | `/tools/pdf-to-jpg` | Coming soon |
| PDF to PNG | `/tools/pdf-to-png` | Coming soon |
| Crop PDF | `/tools/crop-pdf` | Coming soon |
| Repair PDF | `/tools/repair-pdf` | Coming soon |
| Word to PDF | `/tools/word-to-pdf` | Coming soon |
| Excel to PDF | `/tools/excel-to-pdf` | Coming soon |
| PowerPoint to PDF | `/tools/powerpoint-to-pdf` | Coming soon |
| PDF to Word | `/tools/pdf-to-word` | Coming soon |
| PDF to Excel | `/tools/pdf-to-excel` | Coming soon |
| Extract PDF Text | `/tools/pdf-to-text` | Coming soon |

"Coming soon" pages explain the missing technical piece instead of showing a dead upload control. Protect PDF is intentionally unavailable: `pdf-lib` cannot encrypt PDFs, and ArsPDF does not fake password protection.

### Implemented details

- **Merge PDF** — multiple PDFs, drag or arrow reordering, preserved page order, downloadable merged file.
- **Split PDF** — page count detection, `1,3,5-8` range syntax, single combined output or one PDF per page in a ZIP.
- **Organize PDF** — real PDF.js thumbnails, drag reordering, page deletion, 90-degree page rotation, reset, downloadable result.
- **Rotate PDF** — all pages or a selected range, 90/180/270 degrees, preserved page count and content.
- **Image to PDF** — JPG/JPEG/PNG, multiple images, reordering, A4/Letter/fit-to-image pages, configurable margin, preserved aspect ratio.
- **Delete / Extract PDF Pages** — validated page selections, empty-result guards, clear errors.
- **Add Page Numbers** — starting number, six positions, font size, all or selected pages, approximate layout preview.
- **Watermark PDF** — text, opacity, font size, rotation, six placements, all or selected pages, approximate preview.

## Technology stack

- Next.js 15 (App Router), React 19, TypeScript (`strict`)
- Tailwind CSS 3 with CSS-variable theme tokens
- Lucide React icons
- `pdf-lib` for PDF creation and modification
- `pdfjs-dist` for page thumbnails (worker, standard fonts, and CMaps copied to `public/` at install/build)
- `jszip` for the optional split-to-ZIP output
- Vitest for core PDF logic tests
- Playwright Core + an installed Chrome for the optional end-to-end smoke test
- `jpeg-js` as a test-only JPEG fixture generator

No database, authentication, payment processor, analytics SDK, server-side PDF processing, or AI integration is included.

## Local development

Requirements: Node.js 20.19 or newer (developed with Node 24) and npm.

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

`npm install` runs a `postinstall` script that copies the matching PDF.js worker, standard fonts, and CMaps from `node_modules/pdfjs-dist` into `public/`. The same copy runs before `dev` and `build`. These files are generated, not committed.

### Environment variables

Copy `.env.example` to `.env.local` if you want to override the repository or canonical site URL:

```bash
NEXT_PUBLIC_GITHUB_URL=https://github.com/your-user/your-repo
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
```

`NEXT_PUBLIC_GITHUB_URL` falls back to `https://github.com/aryan-sonsurkar/ARSPDF` when unset.

`NEXT_PUBLIC_SITE_URL` powers canonical links, Open Graph and Twitter metadata, `robots.txt`, and `sitemap.xml`. On Vercel, `VERCEL_PROJECT_PRODUCTION_URL` is used automatically when it is unset. Locally, leave it empty so development metadata never advertises `localhost`.

## Commands

```bash
npm run dev        # start the development server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # run Vitest once
npm run test:watch # run Vitest in watch mode
```

## Testing

Core PDF logic is tested without a browser:

```bash
npm test
```

The suite covers merge, split/extract, organize (reorder, delete, rotate), rotate, image-to-PDF, page ranges, page numbers, and watermarks, including invalid-input paths.

An optional real-browser smoke test exercises all nine implemented tools, downloads each result, checks page counts, verifies PDF.js thumbnails render, validates core metadata/robots/sitemap/Open Graph assets, and checks that unavailable tools expose no file input:

```bash
npm run build
npm run start -- -p 3100
# in a second terminal:
npm run test:smoke
```

`test:smoke` uses `playwright-core` with your installed Chrome (`channel: "chrome"`). It does not download a browser. Set `ARSPDF_BASE_URL` if your server runs elsewhere.

## Vercel deployment

1. Push the repository to GitHub.
2. Import it in Vercel as a Next.js project.
3. Keep the default install command (`npm install`) and build command (`npm run build`).
4. Optionally add `NEXT_PUBLIC_GITHUB_URL` and `NEXT_PUBLIC_SITE_URL`. The latter is recommended for a custom domain; otherwise the production Vercel URL is used automatically.
5. Deploy.

There is no required server runtime, database, or secret. All document processing happens in the client. The PDF.js worker, standard fonts, and CMaps are emitted as static assets during install/build. No request-body or function-timeout limits apply to document processing because no document is sent to Vercel.

The app sends baseline security headers (`nosniff`, a strict referrer policy, frame denial, a restricted permissions policy, and a narrow CSP that blocks framing, plugins, and base-tag injection). There is no analytics SDK or third-party request containing document data.

Dependency audit status: `npm audit --omit=dev` reports zero production vulnerabilities. Remaining npm advisories are limited to development-only Tailwind 3/eslint file-watching dependencies (`braces`), whose only offered fix is a breaking Tailwind 4 upgrade; they are not shipped to the browser.

## SEO and social metadata

- Every page has a title, description, canonical URL, and page-specific keywords.
- Open Graph and Twitter cards use the committed `public/og.png` image.
- JSON-LD describes the site (`Organization`, `WebSite`, `WebApplication`) and adds `BreadcrumbList` data to tool and privacy pages.
- `robots.txt` and `sitemap.xml` are generated from the tool registry, with unavailable tools included as lower-priority pages.
- Viewport, dark color scheme, theme color, author metadata, and Google site verification are configured in the root layout.
- Set `NEXT_PUBLIC_SITE_URL` for a custom domain so canonical, Open Graph, and sitemap URLs use it. Vercel's production URL is used automatically otherwise.

## Privacy architecture

- Document bytes stay in the browser tab. All nine working tools manipulate files locally.
- There are no PDF upload endpoints, no external conversion services, and no analytics calls containing document data.
- Documents are not written to `localStorage`, cookies, or IndexedDB.
- PDF.js documents are destroyed when a tool unmounts. Download object URLs are revoked after use.
- The hosting platform still sees normal requests for HTML, JavaScript, and the PDF.js worker.
- Invalid files are validated by extension/MIME at selection time and structurally by the PDF parser during processing.

See `/about` for the user-facing version of this information.

## Known limitations

- **Browser memory is the real limit.** Files are capped at 100 MB each and 250 MB per queue as a safety guard. Complex documents, many high-resolution images, mobile browsers, and low-memory tabs can still fail.
- **Encrypted PDFs are not supported.** Password-protected documents produce a clear error. Protect PDF is not implemented because reliable PDF encryption is unavailable in the current browser-only stack.
- **No fake office conversions.** DOCX/XLSX/PPTX conversion and PDF-to-Word/Excel require dedicated rendering or reconstruction engines. They are not shipped.
- **No OCR.** Scanned documents are not converted to searchable text.
- **Fidelity is not universal.** Unusual fonts, forms, embedded scripts, and exotic PDF structures may not survive an operation. Review generated files.
- **Page numbering and watermarks** are drawn in PDF page coordinate space. Pages with a pre-existing rotation may display the overlay in an unexpected orientation.
- **Image metadata:** EXIF orientation is not normalized when embedding JPEGs; re-export rotated photos before conversion if needed.
- **No duplicate-page insertion** in Organize PDF. Pages can be reordered, rotated, or removed.
- **Page ranges are ascending.** `1,3,5-8` is supported; `8-5` is rejected with an explanation.

## Project structure

```text
src/
  app/                 App Router pages, layout, global theme
  components/
    home/              Hero, searchable tool grid, features
    layout/            Header and footer
    pdf-viewer/        PDF.js page thumbnail
    tools/             Shared workspace UI + nine tool implementations
    ui/                Buttons, logo, GitHub icon
    upload/            Dropzone and selected-file list
  hooks/               File queue, page count, task processor
  lib/
    files/             Validation, formatting, downloads
    pdf/               PDF operations, ranges, errors, PDF.js loader
    tools.ts           Tool registry and availability status
tests/                 Vitest suites + PDF/image fixtures
scripts/               PDF.js worker copy + browser smoke test
```

Processing errors are normalized to user-readable messages. The shared task state uses `idle → processing → success/error` with a reference guard so repeated clicks cannot start a duplicate operation.

## Roadmap

- PDF to JPG/PNG via PDF.js rendering and controlled batch download
- Crop with a visual page-area picker
- Safer page previews for page numbers and watermarks
- Compression research with explicit quality/size expectations
- Text extraction for selectable text (not OCR)
- Password protection only if a maintained, verifiable browser encryption path is found

Anything incomplete stays labeled until it produces a real output file.

## License

MIT. See [LICENSE](./LICENSE).

Copyright (c) 2026 Aryan Sonsurkar.
