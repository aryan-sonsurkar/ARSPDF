import {
  Crop,
  Droplets,
  FileMinus,
  FileOutput,
  FileSpreadsheet,
  FileText,
  FileType,
  Files,
  Hash,
  ImagePlus,
  Images,
  LayoutGrid,
  Lock,
  Minimize2,
  Presentation,
  RotateCw,
  ScanText,
  Scissors,
  Table2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ToolIconName } from "@/lib/tools";

const ICONS: Record<ToolIconName, LucideIcon> = {
  files: Files,
  scissors: Scissors,
  "layout-grid": LayoutGrid,
  rotate: RotateCw,
  "image-plus": ImagePlus,
  "file-minus": FileMinus,
  "file-output": FileOutput,
  hash: Hash,
  droplets: Droplets,
  lock: Lock,
  minimize: Minimize2,
  images: Images,
  crop: Crop,
  wrench: Wrench,
  "file-text": FileText,
  "file-spreadsheet": FileSpreadsheet,
  presentation: Presentation,
  "file-type": FileType,
  table: Table2,
  "scan-text": ScanText,
};

export function ToolIcon({
  name,
  className,
}: {
  name: ToolIconName;
  className?: string;
}) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden="true" />;
}
