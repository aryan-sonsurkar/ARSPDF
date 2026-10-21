export const DOCX_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type DocxTextPage = {
  lines: string[];
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

function paragraph(text: string): string {
  const content = text.replace(/\t/g, "    ");
  if (content.length === 0) return "<w:p/>";
  return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(content)}</w:t></w:r></w:p>`;
}

const PAGE_BREAK = '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';

const CONTENT_TYPES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const ROOT_RELS = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

export async function createTextDocx(pages: DocxTextPage[]): Promise<Uint8Array> {
  const body: string[] = [];

  pages.forEach((page, pageIndex) => {
    if (pageIndex > 0) body.push(PAGE_BREAK);
    const lines = page.lines.length > 0 ? page.lines : [""];
    for (const line of lines) body.push(paragraph(line));
  });

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join(
    "",
  )}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417"/></w:sectPr></w:body></w:document>`;

  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  zip.file("[Content_Types].xml", CONTENT_TYPES);
  zip.file("_rels/.rels", ROOT_RELS);
  zip.file("word/document.xml", documentXml);

  return zip.generateAsync({
    type: "uint8array",
    compression: "DEFLATE",
  });
}
