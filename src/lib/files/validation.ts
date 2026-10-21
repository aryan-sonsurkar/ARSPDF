export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 250 * 1024 * 1024;
export const MAX_FILES = 20;

const PDF_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/octet-stream",
  "",
]);

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/octet-stream",
  "",
]);

function extensionOf(name: string): string {
  const match = /\.([^.]+)$/.exec(name);
  return match?.[1]?.toLowerCase() ?? "";
}

function isWithinSizeLimit(file: File): string | null {
  if (file.size === 0) {
    return `"${file.name}" is empty. Choose a file that contains data.`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `"${file.name}" is larger than 100 MB. Large files can exhaust browser memory — try a smaller document.`;
  }
  return null;
}

export function validatePdfFile(file: File): string | null {
  const sizeError = isWithinSizeLimit(file);
  if (sizeError) return sizeError;

  const extension = extensionOf(file.name);
  const mime = file.type.toLowerCase();
  const hasPdfExtension = extension === "pdf";
  const hasPdfMime = PDF_MIME_TYPES.has(mime);

  if (!hasPdfExtension && !hasPdfMime) {
    return `"${file.name}" is not a PDF. Choose a file with the .pdf extension.`;
  }

  if (hasPdfExtension && !hasPdfMime) {
    return `"${file.name}" has a .pdf extension but its file type is "${file.type}". Choose a genuine PDF file.`;
  }

  return null;
}

export function validateImageFile(file: File): string | null {
  const sizeError = isWithinSizeLimit(file);
  if (sizeError) return sizeError;

  const extension = extensionOf(file.name);
  const mime = file.type.toLowerCase();
  const hasImageExtension = extension === "jpg" || extension === "jpeg" || extension === "png";
  const hasImageMime = IMAGE_MIME_TYPES.has(mime);

  if (!hasImageExtension && !hasImageMime) {
    return `"${file.name}" is not supported. Use a JPG, JPEG, or PNG image.`;
  }

  if (hasImageExtension && !hasImageMime) {
    return `"${file.name}" has an image extension but its file type is "${file.type}". Choose a genuine JPG or PNG image.`;
  }

  return null;
}

type OfficeKind = "word" | "excel" | "powerpoint";

const OFFICE_EXTENSIONS: Record<OfficeKind, string> = {
  word: "docx",
  excel: "xlsx",
  powerpoint: "pptx",
};

const OFFICE_MIME_TYPES: Record<OfficeKind, Set<string>> = {
  word: new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/octet-stream",
    "",
  ]),
  excel: new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/octet-stream",
    "",
  ]),
  powerpoint: new Set([
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/zip",
    "application/octet-stream",
    "",
  ]),
};

const OFFICE_LABELS: Record<OfficeKind, string> = {
  word: "DOCX",
  excel: "XLSX",
  powerpoint: "PPTX",
};

function validateOfficeFile(file: File, kind: OfficeKind): string | null {
  const sizeError = isWithinSizeLimit(file);
  if (sizeError) return sizeError;

  const extension = extensionOf(file.name);
  const mime = file.type.toLowerCase();
  const expected = OFFICE_EXTENSIONS[kind];
  const label = OFFICE_LABELS[kind];

  if (extension !== expected) {
    return `"${file.name}" is not a ${label} file. Save it in the ${label} format and try again.`;
  }

  if (!OFFICE_MIME_TYPES[kind].has(mime)) {
    return `"${file.name}" has a .${expected} extension but its file type is "${file.type}". Choose a genuine ${label} file.`;
  }

  return null;
}

export function validateDocxFile(file: File): string | null {
  return validateOfficeFile(file, "word");
}

export function validateXlsxFile(file: File): string | null {
  return validateOfficeFile(file, "excel");
}

export function validatePptxFile(file: File): string | null {
  return validateOfficeFile(file, "powerpoint");
}

export function validateFileBatch(
  files: File[],
  validate: (file: File) => string | null,
  existingTotalSize = 0,
): { accepted: File[]; errors: string[] } {
  const accepted: File[] = [];
  const errors: string[] = [];
  let total = existingTotalSize;

  for (const file of files) {
    const error = validate(file);
    if (error) {
      errors.push(error);
      continue;
    }
    total += file.size;
    if (total > MAX_TOTAL_SIZE) {
      errors.push(
        "The combined files exceed 250 MB. Remove some files or use smaller documents to avoid running out of browser memory.",
      );
      break;
    }
    accepted.push(file);
  }

  return { accepted, errors };
}
