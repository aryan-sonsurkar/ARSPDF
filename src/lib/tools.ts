export type ToolCategory = "organize" | "edit" | "convert" | "optimize" | "security";

export type ToolStatus = "available" | "coming-soon" | "unavailable";

export type ToolIconName =
  | "files"
  | "scissors"
  | "layout-grid"
  | "rotate"
  | "image-plus"
  | "file-minus"
  | "file-output"
  | "hash"
  | "droplets"
  | "lock"
  | "minimize"
  | "images"
  | "crop"
  | "wrench"
  | "file-text"
  | "file-spreadsheet"
  | "presentation"
  | "file-type"
  | "table"
  | "scan-text"
  | "flip"
  | "file-plus"
  | "unlock"
  | "layers"
  | "tags"
  | "contrast"
  | "type"
  | "list"
  | "file-code";

export type Tool = {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  icon: ToolIconName;
  note?: string;
  limitation?: string;
};

export const CATEGORY_LABELS: Record<ToolCategory, string> = {
  organize: "Organize",
  edit: "Edit",
  convert: "Convert",
  optimize: "Optimize",
  security: "Security",
};

export const TOOLS: Tool[] = [
  {
    slug: "merge-pdf",
    title: "Merge PDF",
    description: "Combine several PDFs into one document, in the order you choose.",
    category: "organize",
    status: "available",
    icon: "files",
  },
  {
    slug: "split-pdf",
    title: "Split PDF",
    description: "Extract chosen pages or page ranges into a separate PDF.",
    category: "organize",
    status: "available",
    icon: "scissors",
  },
  {
    slug: "organize-pdf",
    title: "Organize PDF",
    description: "Reorder, rotate, and remove pages with live page thumbnails.",
    category: "organize",
    status: "available",
    icon: "layout-grid",
  },
  {
    slug: "rotate-pdf",
    title: "Rotate PDF",
    description: "Turn selected pages or the whole document in 90-degree steps.",
    category: "organize",
    status: "available",
    icon: "rotate",
  },
  {
    slug: "delete-pages",
    title: "Delete PDF Pages",
    description: "Remove unwanted pages and keep the rest of the document intact.",
    category: "organize",
    status: "available",
    icon: "file-minus",
  },
  {
    slug: "extract-pages",
    title: "Extract PDF Pages",
    description: "Pull out specific pages into a clean, standalone PDF.",
    category: "organize",
    status: "available",
    icon: "file-output",
  },
  {
    slug: "add-page-numbers",
    title: "Add Page Numbers",
    description: "Stamp page numbers onto all or selected pages with your layout.",
    category: "edit",
    status: "available",
    icon: "hash",
  },
  {
    slug: "watermark-pdf",
    title: "Watermark PDF",
    description: "Overlay configurable text with control over opacity and placement.",
    category: "edit",
    status: "available",
    icon: "droplets",
  },
  {
    slug: "image-to-pdf",
    title: "Image to PDF",
    description: "Turn JPG and PNG images into a paginated PDF with correct aspect ratios.",
    category: "convert",
    status: "available",
    icon: "image-plus",
  },
  {
    slug: "protect-pdf",
    title: "Protect PDF",
    description: "Add AES-256 password protection to a PDF without uploading it.",
    category: "security",
    status: "available",
    icon: "lock",
    limitation:
      "Encryption runs in your browser. The password is never sent anywhere, and ArsPDF cannot recover it if you forget it.",
  },
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    description: "Shrink a PDF by re-saving it or re-rendering image-heavy pages.",
    category: "optimize",
    status: "available",
    icon: "minimize",
    limitation:
      "Maximum compression rasterizes every page. Text, links, and form fields stop being selectable after conversion.",
  },
  {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Render every selected PDF page to a JPG image inside a ZIP file.",
    category: "convert",
    status: "available",
    icon: "images",
    limitation:
      "Pages are rasterized. Text becomes part of the image and is no longer selectable.",
  },
  {
    slug: "pdf-to-png",
    title: "PDF to PNG",
    description: "Render selected PDF pages to lossless PNG images.",
    category: "convert",
    status: "available",
    icon: "image-plus",
    limitation:
      "PNG pages are lossless and can be large. Very high resolutions may exhaust browser memory.",
  },
  {
    slug: "crop-pdf",
    title: "Crop PDF",
    description: "Trim equal margins from every page or a selected page range.",
    category: "edit",
    status: "available",
    icon: "crop",
    limitation:
      "Crop hides content outside the new page box; it does not delete the underlying page data. Rotated pages use their unrotated edges.",
  },
  {
    slug: "repair-pdf",
    title: "Repair PDF",
    description: "Rebuild a damaged PDF that other readers can still open.",
    category: "optimize",
    status: "available",
    icon: "wrench",
    limitation:
      "Repair first tries a lossless rewrite. If that fails, pages are rasterized, so recovered text may no longer be selectable.",
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert a DOCX document into a PDF in your browser.",
    category: "convert",
    status: "available",
    icon: "file-text",
    limitation:
      "Text, headings, lists, tables, and images are converted. Complex Word layouts, footnotes, and tracked changes may shift.",
  },
  {
    slug: "excel-to-pdf",
    title: "Excel to PDF",
    description: "Render XLSX sheets as paginated PDF tables.",
    category: "convert",
    status: "available",
    icon: "file-spreadsheet",
    limitation:
      "Sheets are rendered as tables. Charts, images, macros, comments, and cell styles are not included.",
  },
  {
    slug: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    description: "Convert PPTX slide text into a printable PDF deck.",
    category: "convert",
    status: "available",
    icon: "presentation",
    limitation:
      "Text-focused conversion. Animations, media, speaker notes, and the original slide design are not preserved.",
  },
  {
    slug: "pdf-to-word",
    title: "PDF to Word",
    description: "Extract selectable PDF text into an editable DOCX file.",
    category: "convert",
    status: "available",
    icon: "file-type",
    limitation:
      "Text-focused export. Original fonts, columns, images, and exact page layout are not reconstructed.",
  },
  {
    slug: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Extract PDF text lines into an editable XLSX workbook.",
    category: "convert",
    status: "available",
    icon: "table",
    limitation:
      "Rows and columns are inferred from text positions. Complex or borderless tables may need cleanup in Excel.",
  },
  {
    slug: "pdf-to-text",
    title: "Extract PDF Text",
    description: "Copy selectable text from PDF pages into a TXT file.",
    category: "convert",
    status: "available",
    icon: "scan-text",
    limitation:
      "Only selectable text is extracted. Scanned or image-only pages require OCR, which ArsPDF does not include.",
  },
  {
    slug: "reverse-pdf",
    title: "Reverse PDF",
    description: "Flip the page order so the last page becomes the first.",
    category: "organize",
    status: "available",
    icon: "flip",
  },
  {
    slug: "add-blank-pages",
    title: "Add Blank Pages",
    description: "Insert one or more blank pages at the start or end of a PDF.",
    category: "organize",
    status: "available",
    icon: "file-plus",
    limitation:
      "Blank pages are inserted as empty pages. They do not add headers, footers, or page numbers.",
  },
  {
    slug: "unlock-pdf",
    title: "Unlock PDF",
    description: "Remove password protection from a PDF you can already open.",
    category: "security",
    status: "available",
    icon: "unlock",
    limitation:
      "You must know the current password. The unlocked file is rebuilt from its pages, so interactive forms, annotations, and bookmarks may not carry over.",
  },
  {
    slug: "flatten-pdf",
    title: "Flatten PDF",
    description:
      "Merge form fields and annotations into the page so they stop being editable.",
    category: "edit",
    status: "available",
    icon: "layers",
    limitation:
      "Flattening turns interactive fields and comments into static page content. It cannot be undone in the output.",
  },
  {
    slug: "edit-metadata",
    title: "Edit PDF Metadata",
    description: "Change the title, author, subject, keywords, and creator stored in a PDF.",
    category: "edit",
    status: "available",
    icon: "tags",
    limitation:
      "Metadata is informational. Editing it does not encrypt, sign, or otherwise secure the document.",
  },
  {
    slug: "grayscale-pdf",
    title: "Grayscale PDF",
    description: "Convert every page to black and white for smaller, print-friendly output.",
    category: "optimize",
    status: "available",
    icon: "contrast",
    limitation:
      "Pages are rasterized, so text and links stop being selectable after conversion.",
  },
  {
    slug: "text-to-pdf",
    title: "Text to PDF",
    description: "Turn plain text or a .txt file into a paginated PDF.",
    category: "convert",
    status: "available",
    icon: "type",
    limitation:
      "Text is laid out in a single column with a standard font. Complex formatting, images, and non-Latin scripts are not preserved.",
  },
  {
    slug: "csv-to-pdf",
    title: "CSV to PDF",
    description: "Render CSV rows as a clean, paginated PDF table.",
    category: "convert",
    status: "available",
    icon: "list",
    limitation:
      "Wide tables are scaled to fit the page. Formulas, cell styles, and multiple sheets are ignored.",
  },
  {
    slug: "pdf-to-markdown",
    title: "PDF to Markdown",
    description: "Convert selectable PDF text into a Markdown document.",
    category: "convert",
    status: "available",
    icon: "file-code",
    limitation:
      "Only selectable text is extracted. Headings, bold, tables, and images are not reconstructed exactly.",
  },
];

export function getTool(slug: string): Tool | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export function getAvailableTools(): Tool[] {
  return TOOLS.filter((tool) => tool.status === "available");
}

export const TOOL_CATEGORIES: ToolCategory[] = [
  "organize",
  "edit",
  "convert",
  "optimize",
  "security",
];
