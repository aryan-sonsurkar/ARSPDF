import type { BinaryInput } from "@/types/pdf";
import { loadPdf } from "./load";

export type PdfMetadata = {
  title: string;
  author: string;
  subject: string;
  keywords: string[];
  creator: string;
  producer: string;
};

export type WritePdfMetadataOptions = {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  clear?: boolean;
};

function parseKeywords(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,;\s]+/)
    .map((keyword) => keyword.trim())
    .filter((keyword) => keyword.length > 0);
}

export async function readPdfMetadata(input: BinaryInput): Promise<PdfMetadata> {
  const document = await loadPdf(input);

  return {
    title: document.getTitle() ?? "",
    author: document.getAuthor() ?? "",
    subject: document.getSubject() ?? "",
    keywords: parseKeywords(document.getKeywords()),
    creator: document.getCreator() ?? "",
    producer: document.getProducer() ?? "",
  };
}

export async function writePdfMetadata(
  input: BinaryInput,
  options: WritePdfMetadataOptions = {},
): Promise<Uint8Array> {
  const document = await loadPdf(input);

  if (options.clear) {
    document.setTitle("");
    document.setAuthor("");
    document.setSubject("");
    document.setKeywords([]);
    document.setCreator("");
    document.setProducer("");
  } else {
    if (options.title !== undefined) document.setTitle(options.title);
    if (options.author !== undefined) document.setAuthor(options.author);
    if (options.subject !== undefined) document.setSubject(options.subject);
    if (options.keywords !== undefined) document.setKeywords(options.keywords);
    if (options.creator !== undefined) document.setCreator(options.creator);
    if (options.producer !== undefined) document.setProducer(options.producer);
  }

  return document.save();
}
