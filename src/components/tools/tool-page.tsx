"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import { Loader2 } from "lucide-react";

function ToolLoading() {
  return (
    <div className="mx-auto flex w-full max-w-4xl items-center justify-center px-5 py-24">
      <div className="flex items-center gap-3 text-sm text-muted-foreground" role="status">
        <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
        Loading tool…
      </div>
    </div>
  );
}

const TOOL_COMPONENTS: Record<string, ComponentType> = {
  "merge-pdf": dynamic(() => import("./merge-tool").then((mod) => mod.MergeTool), {
    ssr: false,
    loading: ToolLoading,
  }),
  "split-pdf": dynamic(() => import("./split-tool").then((mod) => mod.SplitTool), {
    ssr: false,
    loading: ToolLoading,
  }),
  "organize-pdf": dynamic(() => import("./organize-tool").then((mod) => mod.OrganizeTool), {
    ssr: false,
    loading: ToolLoading,
  }),
  "rotate-pdf": dynamic(() => import("./rotate-tool").then((mod) => mod.RotateTool), {
    ssr: false,
    loading: ToolLoading,
  }),
  "image-to-pdf": dynamic(
    () => import("./image-to-pdf-tool").then((mod) => mod.ImageToPdfTool),
    { ssr: false, loading: ToolLoading },
  ),
  "delete-pages": dynamic(
    () => import("./delete-pages-tool").then((mod) => mod.DeletePagesTool),
    { ssr: false, loading: ToolLoading },
  ),
  "extract-pages": dynamic(
    () => import("./extract-pages-tool").then((mod) => mod.ExtractPagesTool),
    { ssr: false, loading: ToolLoading },
  ),
  "add-page-numbers": dynamic(
    () => import("./page-numbers-tool").then((mod) => mod.PageNumbersTool),
    { ssr: false, loading: ToolLoading },
  ),
  "watermark-pdf": dynamic(
    () => import("./watermark-tool").then((mod) => mod.WatermarkTool),
    { ssr: false, loading: ToolLoading },
  ),
  "protect-pdf": dynamic(
    () => import("./protect-tool").then((mod) => mod.ProtectTool),
    { ssr: false, loading: ToolLoading },
  ),
  "compress-pdf": dynamic(
    () => import("./compress-tool").then((mod) => mod.CompressTool),
    { ssr: false, loading: ToolLoading },
  ),
  "crop-pdf": dynamic(() => import("./crop-tool").then((mod) => mod.CropTool), {
    ssr: false,
    loading: ToolLoading,
  }),
  "repair-pdf": dynamic(
    () => import("./repair-tool").then((mod) => mod.RepairTool),
    { ssr: false, loading: ToolLoading },
  ),
  "pdf-to-jpg": dynamic(
    () => import("./pdf-image-export-tool").then((mod) => mod.PdfToJpgTool),
    { ssr: false, loading: ToolLoading },
  ),
  "pdf-to-png": dynamic(
    () => import("./pdf-image-export-tool").then((mod) => mod.PdfToPngTool),
    { ssr: false, loading: ToolLoading },
  ),
  "pdf-to-text": dynamic(
    () => import("./pdf-text-export-tool").then((mod) => mod.PdfToTextTool),
    { ssr: false, loading: ToolLoading },
  ),
  "pdf-to-word": dynamic(
    () => import("./pdf-text-export-tool").then((mod) => mod.PdfToWordTool),
    { ssr: false, loading: ToolLoading },
  ),
  "pdf-to-excel": dynamic(
    () => import("./pdf-text-export-tool").then((mod) => mod.PdfToExcelTool),
    { ssr: false, loading: ToolLoading },
  ),
  "word-to-pdf": dynamic(
    () => import("./office-to-pdf-tool").then((mod) => mod.WordToPdfTool),
    { ssr: false, loading: ToolLoading },
  ),
  "excel-to-pdf": dynamic(
    () => import("./office-to-pdf-tool").then((mod) => mod.ExcelToPdfTool),
    { ssr: false, loading: ToolLoading },
  ),
  "powerpoint-to-pdf": dynamic(
    () => import("./office-to-pdf-tool").then((mod) => mod.PowerPointToPdfTool),
    { ssr: false, loading: ToolLoading },
  ),
};

export function ToolPage({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];
  if (!Component) return null;
  return <Component />;
}
