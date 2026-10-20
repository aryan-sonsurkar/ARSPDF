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
};

export function ToolPage({ slug }: { slug: string }) {
  const Component = TOOL_COMPONENTS[slug];
  if (!Component) return null;
  return <Component />;
}
