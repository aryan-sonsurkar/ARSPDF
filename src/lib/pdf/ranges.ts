export type PageRangeResult =
  | { ok: true; pages: number[] }
  | { ok: false; error: string };

export function parsePageRanges(input: string, pageCount: number): PageRangeResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return {
      ok: false,
      error: "Enter at least one page number or range, such as 1,3,5-8.",
    };
  }

  if (!Number.isInteger(pageCount) || pageCount < 1) {
    return { ok: false, error: "The document does not contain any pages." };
  }

  const tokens = trimmed.split(",");
  const pages: number[] = [];
  const seen = new Set<number>();

  for (const rawToken of tokens) {
    const token = rawToken.trim();
    if (token.length === 0) {
      return {
        ok: false,
        error: "One of the entries is empty. Use commas between pages, for example 1,3,5-8.",
      };
    }

    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(token);
    const singleMatch = /^\d+$/.exec(token);

    if (rangeMatch) {
      const startText = rangeMatch[1] ?? "";
      const endText = rangeMatch[2] ?? "";
      const start = Number(startText);
      const end = Number(endText);

      if (start < 1 || end < 1) {
        return {
          ok: false,
          error: `Page numbers start at 1. "${token}" is not a valid range.`,
        };
      }
      if (start > pageCount || end > pageCount) {
        return {
          ok: false,
          error: `"${token}" goes beyond page ${pageCount}, the last page in this document.`,
        };
      }
      if (start > end) {
        return {
          ok: false,
          error: `"${token}" is reversed. Write the smaller page first, such as ${end}-${start}.`,
        };
      }

      for (let page = start; page <= end; page += 1) {
        if (!seen.has(page)) {
          seen.add(page);
          pages.push(page);
        }
      }
      continue;
    }

    if (singleMatch) {
      const page = Number(token);
      if (page < 1) {
        return {
          ok: false,
          error: `Page numbers start at 1. "${token}" is not valid.`,
        };
      }
      if (page > pageCount) {
        return {
          ok: false,
          error: `Page ${page} does not exist. This document has ${pageCount} page${pageCount === 1 ? "" : "s"}.`,
        };
      }
      if (!seen.has(page)) {
        seen.add(page);
        pages.push(page);
      }
      continue;
    }

    return {
      ok: false,
      error: `"${token}" is not a page number or range. Use formats like 2, 7, or 4-9.`,
    };
  }

  if (pages.length === 0) {
    return { ok: false, error: "Select at least one page." };
  }

  return { ok: true, pages };
}

export function formatPageSelection(pages: number[]): string {
  if (pages.length === 0) return "No pages";
  if (pages.length === 1) return `Page ${pages[0]}`;
  return `${pages.length} pages`;
}
