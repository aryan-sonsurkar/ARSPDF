export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / Math.pow(1024, exponent);
  const fractionDigits = exponent === 0 ? 0 : value >= 10 ? 1 : 2;

  return `${value.toFixed(fractionDigits)} ${units[exponent]}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function sanitizeBaseName(name: string): string {
  const withoutExtension = name.replace(
    /\.(pdf|docx|xlsx|pptx|txt|zip|jpg|jpeg|png|doc|xls|ppt)$/i,
    "",
  );
  const cleaned = withoutExtension
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.length > 0 ? cleaned.slice(0, 70) : "document";
}
