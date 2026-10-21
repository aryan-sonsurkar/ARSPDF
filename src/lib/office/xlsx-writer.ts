export const XLSX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export type XlsxSheet = {
  name: string;
  rows: string[][];
};

function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnName(index: number): string {
  let value = index;
  let name = "";
  while (value >= 0) {
    name = String.fromCharCode(65 + (value % 26)) + name;
    value = Math.floor(value / 26) - 1;
  }
  return name;
}

export function sanitizeSheetName(name: string, fallback: string): string {
  const cleaned = name
    .replace(/[[\]:*?/\\]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 31);
  return cleaned.length > 0 ? cleaned : fallback;
}

function worksheetXml(rows: string[][]): string {
  const maxColumns = rows.reduce(
    (maximum, row) => Math.max(maximum, row.length),
    0,
  );
  const dimension =
    rows.length > 0 && maxColumns > 0
      ? `A1:${columnName(maxColumns - 1)}${rows.length}`
      : "A1";

  const rowXml = rows
    .map((row, rowIndex) => {
      const cells = row
        .map((value, columnIndex) => {
          const ref = `${columnName(columnIndex)}${rowIndex + 1}`;
          if (value.length === 0) return `<c r="${ref}"/>`;
          return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
            value,
          )}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowIndex + 1}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><dimension ref="${dimension}"/><sheetViews><sheetView workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/><sheetData>${rowXml}</sheetData></worksheet>`;
}

const STYLES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`;

export async function writeXlsx(sheets: XlsxSheet[]): Promise<Uint8Array> {
  const normalized = sheets.map((sheet, index) => ({
    name: sanitizeSheetName(sheet.name, `Sheet${index + 1}`),
    rows: sheet.rows,
  }));

  const seen = new Set<string>();
  for (const sheet of normalized) {
    let candidate = sheet.name;
    let suffix = 2;
    while (seen.has(candidate.toLowerCase())) {
      candidate = `${sheet.name.slice(0, 28)}-${suffix}`;
      suffix += 1;
    }
    seen.add(candidate.toLowerCase());
    sheet.name = candidate;
  }

  const sheetOverrides = normalized
    .map(
      (_, index) =>
        `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
    )
    .join("");

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
${sheetOverrides}
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const workbookSheets = normalized
    .map(
      (sheet, index) =>
        `<sheet name="${escapeXml(sheet.name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join("");

  const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${workbookSheets}</sheets></workbook>`;

  const styleRelationship = `<Relationship Id="rId${normalized.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`;
  const sheetRelationships = normalized
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
    )
    .join("");

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRelationships}${styleRelationship}</Relationships>`;

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file("[Content_Types].xml", contentTypes);
  zip.file("_rels/.rels", rootRels);
  zip.file("xl/workbook.xml", workbookXml);
  zip.file("xl/_rels/workbook.xml.rels", workbookRels);
  zip.file("xl/styles.xml", STYLES_XML);

  normalized.forEach((sheet, index) => {
    zip.file(`xl/worksheets/sheet${index + 1}.xml`, worksheetXml(sheet.rows));
  });

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
  });
}
