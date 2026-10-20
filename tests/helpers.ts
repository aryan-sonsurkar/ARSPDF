import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { encode as encodeJpeg } from "jpeg-js";

export async function createPdf(widths: number[] = [200, 300, 400]): Promise<Uint8Array> {
  const document = await PDFDocument.create();
  const font = await document.embedFont(StandardFonts.Helvetica);

  widths.forEach((width, index) => {
    const page = document.addPage([width, width * 1.4]);
    page.drawText(`Page ${index + 1}`, {
      x: 20,
      y: width * 1.4 - 40,
      size: 14,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
  });

  return document.save();
}

export const ONE_PIXEL_PNG = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
    "base64",
  ),
);

export function createJpeg(width = 20, height = 10): Uint8Array {
  const data = Buffer.alloc(width * height * 4);
  for (let index = 0; index < width * height; index += 1) {
    data[index * 4] = 220;
    data[index * 4 + 1] = 80;
    data[index * 4 + 2] = 90;
    data[index * 4 + 3] = 255;
  }
  return Uint8Array.from(encodeJpeg({ width, height, data }, 80).data);
}
