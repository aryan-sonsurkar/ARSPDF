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
      <span className="relative grid h-10 w-10 -rotate-3 place-items-center rounded-[14px_10px_16px_12px] border-2 border-dashed border-chalk-yellow/60 bg-chalk-yellow/10 text-chalk-yellow shadow-glow transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
        <FileText className="h-[19px] w-[19px]" strokeWidth={2.4} />
        <span className="absolute -right-1.5 -top-1.5 text-[13px] leading-none text-chalk-pink">
          *
        </span>
      </span>
      {showWordmark ? (
        <span className="font-marker text-[1.15rem] leading-none tracking-tight chalk-heading">
          Ars<span className="text-chalk-yellow">PDF</span>
        </span>
      ) : null}
    </Link>
  );
}
