import Link from "next/link";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showWordmark = true,
}: {
  className?: string;
  href?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-offset-4",
        className,
      )}
      aria-label="ArsPDF home"
    >
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/25 via-elevated to-elevated shadow-glow transition-transform duration-300 group-hover:-translate-y-0.5">
        <FileText className="h-[18px] w-[18px] text-primary" strokeWidth={2.2} />
        <span className="absolute inset-x-1 bottom-1 h-px bg-primary/40" />
      </span>
      {showWordmark ? (
        <span className="font-display text-[1.05rem] font-semibold tracking-tight">
          Ars<span className="text-primary">PDF</span>
        </span>
      ) : null}
    </Link>
  );
}
