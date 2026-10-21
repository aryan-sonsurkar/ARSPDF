"use client";

import type JSZip from "jszip";
import { PdfToolError } from "@/lib/pdf/errors";
import { escapeHtml } from "./html-escape";

type DocxRelationship = {
  target: string;
  type: string;
};

const IMAGE_MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  tiff: "image/tiff",
};

function localName(node: Node): string {
  const value = (node as Node & { localName?: string }).localName;
  return value ?? node.nodeName.replace(/^.*:/, "");
}

function childrenOf(element: Element, name: string): Element[] {
  return Array.from(element.children).filter((child) => localName(child) === name);
}

function firstChildOf(element: Element, name: string): Element | null {
  return childrenOf(element, name)[0] ?? null;
}

function descendantsOf(element: Element, name: string): Element[] {
  return Array.from(element.getElementsByTagNameNS("*", name));
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

function resolveWordTarget(target: string): string {
  if (target.startsWith("/")) return normalizePath(target);
  return normalizePath(`word/${target}`);
}

async function readRelationships(
  zip: JSZip,
): Promise<Map<string, DocxRelationship>> {
  const relationships = new Map<string, DocxRelationship>();
  const file = zip.file("word/_rels/document.xml.rels");
  if (!file) return relationships;

  const xml = await file.async("string");
  const document = new DOMParser().parseFromString(xml, "application/xml");

  for (const node of Array.from(document.getElementsByTagName("Relationship"))) {
    const id = node.getAttribute("Id");
    const target = node.getAttribute("Target");
    const type = node.getAttribute("Type") ?? "";
    if (id && target) relationships.set(id, { target, type });
  }

  return relationships;
}

function formatRun(run: Element): string {
  const runProperties = firstChildOf(run, "rPr");
  const bold = runProperties ? firstChildOf(runProperties, "b") !== null : false;
  const italic = runProperties ? firstChildOf(runProperties, "i") !== null : false;
  const underline = runProperties ? firstChildOf(runProperties, "u") !== null : false;
  const strike = runProperties ? firstChildOf(runProperties, "strike") !== null : false;

  let html = "";

  for (const node of Array.from(run.children)) {
    const name = localName(node);

    if (name === "t") {
      html += escapeHtml(node.textContent ?? "");
    } else if (name === "tab") {
      html += "    ";
    } else if (name === "br" || name === "cr") {
      html += "<br/>";
    } else if (name === "drawing" || name === "pict" || name === "object") {
      const blip = descendantsOf(node, "blip")[0];
      const imageData = descendantsOf(node, "imagedata")[0];
      const embed =
        (blip ? attributeOf(blip, "embed") : null) ??
        (imageData ? attributeOf(imageData, "id") : null);
      if (embed) html += `<img data-rel="${escapeHtml(embed)}" alt=""/>`;
    }
  }

  if (html.length === 0) return "";

  let wrapped = html;
  if (strike) wrapped = `<s>${wrapped}</s>`;
  if (underline) wrapped = `<u>${wrapped}</u>`;
  if (italic) wrapped = `<em>${wrapped}</em>`;
  if (bold) wrapped = `<strong>${wrapped}</strong>`;
  return wrapped;
}

function paragraphInner(paragraph: Element): string {
  let html = "";

  for (const node of Array.from(paragraph.children)) {
    const name = localName(node);

    if (name === "r") {
      html += formatRun(node);
    } else if (name === "hyperlink" || name === "smartTag" || name === "ins") {
      for (const run of childrenOf(node, "r")) html += formatRun(run);
    }
  }

  return html;
}

function paragraphHtml(paragraph: Element): string {
  const properties = firstChildOf(paragraph, "pPr");
  const styleNode = properties ? firstChildOf(properties, "pStyle") : null;
  const style = (styleNode ? attributeOf(styleNode, "val") ?? "" : "")
    .replace(/\s/g, "")
    .toLowerCase();
  const headingMatch = /^heading([1-6])$/.exec(style);
  const isList = properties ? firstChildOf(properties, "numPr") !== null : false;
  const inner = paragraphInner(paragraph);

  if (style === "title") return `<h1>${inner}</h1>`;
  if (headingMatch) {
    const level = Math.min(Number(headingMatch[1]) + 1, 6);
    return `<h${level}>${inner}</h${level}>`;
  }
  if (isList) return `<p class="docx-list">${inner}</p>`;
  return `<p>${inner}</p>`;
}

function tableHtml(table: Element): string {
  const rows = childrenOf(table, "tr")
    .map((row) => {
      const cells = childrenOf(row, "tc")
        .map((cell) => {
          const paragraphs = childrenOf(cell, "p")
            .map((paragraph) => paragraphInner(paragraph))
            .filter((html) => html.length > 0)
            .join("<br/>");
          return `<td>${paragraphs}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `<table><tbody>${rows}</tbody></table>`;
}

async function resolveImages(
  html: string,
  zip: JSZip,
  relationships: Map<string, DocxRelationship>,
): Promise<string> {
  const matches = Array.from(html.matchAll(/<img data-rel="([^"]+)" alt=""/g));
  let output = html;

  for (const match of matches) {
    const id = match[1]!;
    const relationship = relationships.get(id);
    if (!relationship) {
      output = output.replace(match[0], "");
      continue;
    }

    const path = resolveWordTarget(relationship.target);
    const extension = path.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = IMAGE_MIME_TYPES[extension];
    const file = mimeType ? zip.file(path) : null;

    if (!file) {
      output = output.replace(match[0], "");
      continue;
    }

    const base64 = await file.async("base64");
    output = output.replace(
      match[0],
      `<img src="data:${mimeType};base64,${base64}" alt=""/>`,
    );
  }

  return output;
}

export async function docxToHtml(bytes: Uint8Array): Promise<string> {
  const { default: JSZip } = await import("jszip");
  const zip = await JSZip.loadAsync(bytes);
  const documentFile = zip.file("word/document.xml");

  if (!documentFile) {
    throw new PdfToolError(
      "This does not look like a DOCX file. Legacy .doc files are not supported.",
    );
  }

  const xml = await documentFile.async("string");
  const document = new DOMParser().parseFromString(xml, "application/xml");

  if (document.getElementsByTagName("parsererror").length > 0) {
    throw new PdfToolError("The DOCX document could not be parsed. The file may be damaged.");
  }

  const body = document.getElementsByTagNameNS("*", "body")[0];
  if (!body) {
    throw new PdfToolError("The DOCX document does not contain any readable content.");
  }

  const relationships = await readRelationships(zip);
  const blocks: string[] = [];

  for (const child of Array.from(body.children)) {
    const name = localName(child);
    if (name === "p") blocks.push(paragraphHtml(child));
    else if (name === "tbl") blocks.push(tableHtml(child));
  }

  const html = await resolveImages(blocks.join(""), zip, relationships);

  if (html.replace(/<[^>]*>/g, "").trim().length === 0) {
    throw new PdfToolError("No readable text or images were found in this DOCX file.");
  }

  return html;
}
