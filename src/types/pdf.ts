export type ToolResult = {
  bytes: Uint8Array;
  filename: string;
  mimeType?: string;
};

export type BinaryInput = ArrayBuffer | Uint8Array;

export type PdfSource = {
  name: string;
  data: ArrayBuffer | Uint8Array;
};

export type PdfPagePosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";
