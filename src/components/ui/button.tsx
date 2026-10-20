import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.8)] hover:bg-primary-hover active:translate-y-px",
  secondary:
    "border border-border bg-elevated text-foreground hover:border-border hover:bg-[hsl(222_22%_17%)]",
  ghost: "text-muted-foreground hover:bg-elevated hover:text-foreground",
  danger:
    "border border-destructive/30 bg-destructive/10 text-[hsl(0_90%_70%)] hover:bg-destructive/20",
  outline:
    "border border-primary/35 bg-primary/5 text-foreground hover:border-primary/60 hover:bg-primary/10",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-[0.95rem]",
  icon: "h-9 w-9",
};

export const buttonClasses = (variant: Variant = "primary", size: Size = "md") =>
  cn(
    "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-offset-2",
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
