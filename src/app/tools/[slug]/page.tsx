import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPage } from "@/components/tools/tool-page";
import { UnavailableTool } from "@/components/tools/unavailable-tool";
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

  return {
    title: tool.title,
    description: tool.description,
  };
}

export default async function ToolRoute({ params }: ToolRouteProps) {
  const { slug } = await params;
  const tool = getTool(slug);

  if (!tool) {
    notFound();
  }

  if (tool.status !== "available") {
    return <UnavailableTool tool={tool} />;
  }

  return <ToolPage slug={slug} />;
}
