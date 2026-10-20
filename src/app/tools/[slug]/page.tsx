import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { ToolPage } from "@/components/tools/tool-page";
import { UnavailableTool } from "@/components/tools/unavailable-tool";
import { createPageMetadata } from "@/lib/site";
import { buildBreadcrumbStructuredData } from "@/lib/structured-data";
import { getTool, TOOLS } from "@/lib/tools";

export const dynamicParams = false;

type ToolRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return TOOLS.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: ToolRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    return { title: "Tool not found" };
  }

  return createPageMetadata({
    title: tool.title,
    description: tool.description,
    path: `/tools/${tool.slug}`,
    keywords: [
      tool.title,
      `${tool.title} online`,
      `${tool.title} free`,
      "PDF tool",
      "browser-based PDF",
      "no upload",
    ],
  });
}

export default async function ToolRoute({ params }: ToolRouteProps) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  const breadcrumbData = buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Tools", path: "/#tools" },
    { name: tool.title, path: `/tools/${tool.slug}` },
  ]);

  return (
    <>
      {breadcrumbData ? <JsonLd data={breadcrumbData} /> : null}
      {tool.status === "available" ? (
        <ToolPage slug={slug} />
      ) : (
        <UnavailableTool tool={tool} />
      )}
    </>
  );
}
