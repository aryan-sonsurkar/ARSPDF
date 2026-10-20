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
  | "scan-text";

export type Tool = {
  slug: string;
  title: string;
  description: string;
  category: ToolCategory;
  status: ToolStatus;
  icon: ToolIconName;
  note?: string;
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
    description: "Password-protect a PDF. Not available: ArsPDF will not fake encryption.",
    category: "security",
    status: "unavailable",
    icon: "lock",
    note: "Reliable PDF encryption is not available in the current browser-only stack.",
  },
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    description: "Reduce file size without a misleading, barely-changed result.",
    category: "optimize",
    status: "coming-soon",
    icon: "minimize",
    note: "Reliable compression needs a dedicated optimization pipeline. Not shipped yet.",
  },
  {
    slug: "pdf-to-jpg",
    title: "PDF to JPG",
    description: "Render PDF pages to JPG images for download.",
    category: "convert",
    status: "coming-soon",
    icon: "images",
    note: "Page rendering and batch image export are planned. Not available in this build.",
  },
  {
    slug: "pdf-to-png",
    title: "PDF to PNG",
    description: "Render PDF pages to lossless PNG images.",
    category: "convert",
    status: "coming-soon",
    icon: "image-plus",
    note: "Page rendering and batch image export are planned. Not available in this build.",
  },
  {
    slug: "crop-pdf",
    title: "Crop PDF",
    description: "Trim page margins or crop to a custom area.",
    category: "edit",
    status: "coming-soon",
    icon: "crop",
    note: "Crop controls need careful content-box handling. Not shipped yet.",
  },
  {
    slug: "repair-pdf",
    title: "Repair PDF",
    description: "Attempt to recover a damaged or unreadable PDF.",
    category: "optimize",
    status: "coming-soon",
    icon: "wrench",
    note: "No dependable browser-based repair engine is included. Not shipped.",
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF",
    description: "Convert DOCX documents into PDF.",
    category: "convert",
    status: "coming-soon",
    icon: "file-text",
    note: "High-fidelity DOCX layout requires a full office rendering engine, which is not browser-feasible here.",
  },
  {
    slug: "excel-to-pdf",
    title: "Excel to PDF",
    description: "Convert spreadsheets into paginated PDFs.",
    category: "convert",
    status: "coming-soon",
    icon: "file-spreadsheet",
    note: "Spreadsheet pagination and formula fidelity need a desktop-grade office engine.",
  },
  {
    slug: "powerpoint-to-pdf",
    title: "PowerPoint to PDF",
    description: "Convert presentation slides into PDF pages.",
    category: "convert",
    status: "coming-soon",
    icon: "presentation",
    note: "Slide rendering requires an office rendering engine that is not part of this browser-only build.",
  },
  {
    slug: "pdf-to-word",
    title: "PDF to Word",
    description: "Convert PDF pages into an editable document.",
    category: "convert",
    status: "coming-soon",
    icon: "file-type",
    note: "Reliable layout reconstruction needs a dedicated conversion service. ArsPDF will not rename files and call it conversion.",
  },
  {
    slug: "pdf-to-excel",
    title: "PDF to Excel",
    description: "Extract tables from PDFs into a spreadsheet.",
    category: "convert",
    status: "coming-soon",
    icon: "table",
    note: "Table detection needs a dedicated parsing engine. Not shipped.",
  },
  {
    slug: "pdf-to-text",
    title: "Extract PDF Text",
    description: "Copy selectable text from PDF pages.",
    category: "convert",
    status: "coming-soon",
    icon: "scan-text",
    note: "Selectable-text extraction is planned. Scanned pages would require OCR, which is not included.",
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
