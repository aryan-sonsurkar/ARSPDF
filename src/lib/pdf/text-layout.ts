export type PdfTextItem = {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PdfTextLine = {
  y: number;
  text: string;
  cells: string[];
};

export type PdfTextPage = {
  pageNumber: number;
  lines: PdfTextLine[];
  text: string;
};

function cleanText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function flushLine(items: PdfTextItem[]): PdfTextLine {
  const ordered = [...items].sort((a, b) => a.x - b.x);
  const cells: string[] = [];
  let currentCell = "";
  let lineText = "";
  let previousEnd: number | null = null;

  for (const item of ordered) {
    const gap = previousEnd === null ? 0 : item.x - previousEnd;

    if (previousEnd !== null && gap > 1.5) {
      currentCell += " ";
      lineText += " ";
    }

    if (previousEnd !== null && gap > 12) {
      if (currentCell.trim().length > 0) cells.push(currentCell.trim());
      currentCell = "";
    }

    currentCell += item.text;
    lineText += item.text;
    previousEnd = Math.max(previousEnd ?? -Infinity, item.x + item.width);
  }

  if (currentCell.trim().length > 0) cells.push(currentCell.trim());

  return {
    y: ordered[0]?.y ?? 0,
    text: lineText.trim(),
    cells,
  };
}

export function groupTextItems(items: PdfTextItem[]): PdfTextLine[] {
  const usable = items
    .map((item) => ({
      ...item,
      text: cleanText(item.text),
    }))
    .filter((item) => item.text.length > 0);

  const sorted = [...usable].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 2) return b.y - a.y;
    return a.x - b.x;
  });

  const groups: Array<{ baseline: number; items: PdfTextItem[] }> = [];

  for (const item of sorted) {
    const current = groups[groups.length - 1];
    const tolerance = Math.max(2, Math.min(item.height || 10, 18) * 0.4);

    if (current && Math.abs(current.baseline - item.y) <= tolerance) {
      current.items.push(item);
    } else {
      groups.push({ baseline: item.y, items: [item] });
    }
  }

  return groups
    .map((group) => flushLine(group.items))
    .filter((line) => line.text.length > 0);
}

export function buildPdfTextPage(
  pageNumber: number,
  items: PdfTextItem[],
): PdfTextPage {
  const lines = groupTextItems(items);

  return {
    pageNumber,
    lines,
    text: lines.map((line) => line.text).join("\n"),
  };
}

export function textPagesToPlainText(pages: PdfTextPage[]): string {
  return `${pages
    .map(
      (page) =>
        `--- Page ${page.pageNumber} ---\n${
          page.text.length > 0 ? page.text : "(no selectable text on this page)"
        }`,
    )
    .join("\n\n")
    .trimEnd()}\n`;
}

export function textPagesToMarkdown(pages: PdfTextPage[]): string {
  if (pages.length === 0) return "";

  const sections = pages.map((page) => {
    const lines = page.lines
      .map((line) => line.text.trim())
      .filter((line) => line.length > 0);

    const body = lines
      .map((line) => {
        if (/^[\u2022\u00b7]\s+/.test(line)) {
          return `- ${line.replace(/^[\u2022\u00b7]\s+/, "")}`;
        }
        return line;
      })
      .join("\n\n");

    return `# Page ${page.pageNumber}\n\n${body || "_(no selectable text on this page)_"}`;
  });

  return `${sections.join("\n\n")}\n`;
}
