import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "border-2 border-chalk-yellow bg-chalk-yellow text-primary-foreground shadow-[0_6px_0_-1px_hsl(44_98%_44%),0_16px_30px_-18px_hsl(var(--chalk-yellow)/0.9)] hover:-translate-y-0.5 hover:bg-primary-hover active:translate-y-0.5 active:shadow-[0_2px_0_-1px_hsl(44_98%_44%)]",
  secondary:
    "border-2 border-dashed border-foreground/30 bg-surface/60 text-foreground hover:-translate-y-0.5 hover:border-chalk-blue/70 hover:bg-elevated",
  ghost: "text-muted-foreground hover:bg-elevated hover:text-foreground",
  danger:
    "border-2 border-destructive/50 bg-destructive/15 text-[hsl(348_100%_80%)] hover:bg-destructive/25",
  outline:
    "border-2 border-chalk-yellow/60 bg-chalk-yellow/[0.07] text-foreground hover:-translate-y-0.5 hover:border-chalk-yellow hover:bg-chalk-yellow/15",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-10 px-3.5 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11",
};

export const buttonClasses = (variant: Variant = "primary", size: Size = "md") =>
  cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-offset-2",
    variantClasses[variant],
    sizeClasses[size],
  );

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses(variant, size), className)}
      {...props}
    />
  );
}

export function ButtonLink({
  href,
  className,
  variant = "primary",
  size = "md",
  children,
  external = false,
  onClick,
}: {
  href: string;
  className?: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  external?: boolean;
  onClick?: () => void;
}) {
  const classes = cn(buttonClasses(variant, size), className);

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noreferrer noopener"
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} onClick={onClick}>
      {children}
    </Link>
  );
}
