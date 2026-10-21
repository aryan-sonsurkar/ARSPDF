"use client";

import { PdfToolError } from "@/lib/pdf/errors";
import type { XlsxSheet } from "./xlsx-writer";

const MAX_ROWS = 2500;
const MAX_COLUMNS = 60;

function localName(node: Node): string {
  const value = (node as Node & { localName?: string }).localName;
  return value ?? node.nodeName.replace(/^.*:/, "");
}

function attributeOf(element: Element, name: string): string | null {
  const direct = element.getAttribute(name);
  if (direct !== null) return direct;

  for (const attribute of Array.from(element.attributes)) {
    if ((attribute.localName ?? attribute.name) === name) return attribute.value;
  }

  return null;
}

function normalizePath(path: string): string {
  const segments: string[] = [];
  for (const segment of path.replace(/\\/g, "/").split("/")) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return segments.join("/");
}

function resolveWorkbookTarget(target: string): string {
  if (target.startsWith("/")) return normalizePath(target);
  return normalizePath(`xl/${target}`);
}

function columnIndex(reference: string): number {
  const letters = /^[A-Z]+/i.exec(reference)?.[0]?.toUpperCase();
  if (!letters) return -1;

  let index = 0;
  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }
  return index - 1;
}

function cellValue(
  cell: Element,
  sharedStrings: string[],
): string {
  const type = cell.getAttribute("t");

  if (type === "inlineStr") {
    const inline = Array.from(cell.getElementsByTagName("t"))
      .map((node) => node.textContent ?? "")
      .join("");
    return inline;
  }

  const valueNode = Array.from(cell.children).find(
    (child) => localName(child) === "v",
  );
  const raw = valueNode?.textContent ?? "";

  if (type === "s") {
    const index = Number(raw);
    return Number.isInteger(index) ? sharedStrings[index] ?? raw : raw;
  }

  if (type === "b") return raw === "1" ? "TRUE" : "FALSE";

  return raw;
}

export async function readXlsx(bytes: Uint8Array): Promise<XlsxSheet[]> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(bytes);
  const workbookFile = zip.file("xl/workbook.xml");

  if (!workbookFile) {
    throw new PdfToolError(
      "This does not look like an XLSX file. Legacy .xls files are not supported.",
    );
  }

  const workbookDocument = new DOMParser().parseFromString(
    await workbookFile.async("string"),
    "application/xml",
  );

  if (workbookDocument.getElementsByTagName("parsererror").length > 0) {
    throw new PdfToolError("The workbook could not be parsed. The file may be damaged.");
  }

  const sharedStrings: string[] = [];
  const sharedFile = zip.file("xl/sharedStrings.xml");
  if (sharedFile) {
    const sharedDocument = new DOMParser().parseFromString(
      await sharedFile.async("string"),
      "application/xml",
    );
    for (const item of Array.from(sharedDocument.getElementsByTagName("si"))) {
      sharedStrings.push(item.textContent ?? "");
    }
  }

  const relationships = new Map<string, string>();
  const relsFile = zip.file("xl/_rels/workbook.xml.rels");
  if (relsFile) {
    const relsDocument = new DOMParser().parseFromString(
      await relsFile.async("string"),
      "application/xml",
    );
    for (const node of Array.from(
      relsDocument.getElementsByTagName("Relationship"),
    )) {
      const id = node.getAttribute("Id");
      const target = node.getAttribute("Target");
      if (id && target) relationships.set(id, target);
    }
  }

  const sheetNodes = Array.from(
    workbookDocument.getElementsByTagName("sheet"),
  );
  if (sheetNodes.length === 0) {
    throw new PdfToolError("This workbook does not contain any sheets.");
  }

  const sheets: XlsxSheet[] = [];

  for (const [sheetIndex, sheetNode] of sheetNodes.entries()) {
    const name = sheetNode.getAttribute("name") ?? `Sheet${sheetIndex + 1}`;
    const relationId = attributeOf(sheetNode, "id");
    const target = relationId ? relationships.get(relationId) : undefined;
    const path = target
      ? resolveWorkbookTarget(target)
      : `xl/worksheets/sheet${sheetIndex + 1}.xml`;
    const worksheetFile = zip.file(path);

    if (!worksheetFile) {
      throw new PdfToolError(`The sheet "${name}" could not be read from this workbook.`);
    }

    const worksheetDocument = new DOMParser().parseFromString(
      await worksheetFile.async("string"),
      "application/xml",
    );

    const rowNodes = Array.from(worksheetDocument.getElementsByTagName("row"));
    if (rowNodes.length > MAX_ROWS) {
      throw new PdfToolError(
        `The sheet "${name}" has more than ${MAX_ROWS} rows. Large spreadsheets can exhaust browser memory; split the file first.`,
      );
    }

    const rows: string[][] = [];

    for (const [rowIndex, rowNode] of rowNodes.entries()) {
      const cells = Array.from(rowNode.getElementsByTagName("c"));
      const values: string[] = [];

      for (const [fallbackIndex, cell] of cells.entries()) {
        const reference = cell.getAttribute("r") ?? "";
        const index =
          reference.length > 0 ? columnIndex(reference) : fallbackIndex;
        if (index < 0) continue;
        if (index >= MAX_COLUMNS) {
          throw new PdfToolError(
            `The sheet "${name}" has more than ${MAX_COLUMNS} columns. Split the workbook before converting it to PDF.`,
          );
        }
        values[index] = cellValue(cell, sharedStrings);
      }

      while (values.length > 0 && (values[values.length - 1] ?? "").length === 0) {
        values.pop();
      }

      rows[rowIndex] = values;
    }

    while (
      rows.length > 0 &&
      (rows[rows.length - 1] ?? []).every((value) => (value ?? "").length === 0)
    ) {
      rows.pop();
    }

    sheets.push({ name, rows });
  }

  if (sheets.every((sheet) => sheet.rows.length === 0)) {
    throw new PdfToolError("This workbook does not contain any cell data to convert.");
  }

  return sheets;
}
