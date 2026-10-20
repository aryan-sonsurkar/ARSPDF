import type { Metadata } from "next";
import { Features } from "@/components/home/features";
import { Hero } from "@/components/home/hero";
import { ToolExplorer } from "@/components/home/tool-explorer";
import { TOOLS } from "@/lib/tools";

export const metadata: Metadata = {
  title: "ArsPDF — Every PDF tool. No paywalls.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <ToolExplorer tools={TOOLS} />
      <Features />
      <div className="h-4" />
    </>
  );
}
