export function downloadBytes(
  bytes: Uint8Array,
  filename: string,
  mimeType = "application/pdf",
): void {
  if (typeof window === "undefined") {
    throw new Error("Downloads are only available in the browser.");
  }

  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
