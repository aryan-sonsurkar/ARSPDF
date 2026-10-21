"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { GitHubIcon } from "@/components/ui/github-icon";
import { Logo } from "@/components/ui/logo";
import { GITHUB_URL } from "@/lib/config";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#tools", label: "Tools", hoverClass: "hover:doodle-underline" },
  { href: "/#features", label: "Features", hoverClass: "hover:doodle-underline-pink" },
  { href: "/about", label: "About", hoverClass: "hover:text-chalk-yellow" },
];

const CHALK_PIECES = [
  "bg-chalk-yellow",
  "bg-chalk-pink",
  "bg-chalk-blue",
  "bg-chalk-green",
  "bg-chalk-orange",
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-dashed border-foreground/15 bg-[hsl(152_24%_7%)]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 font-display text-[15px] tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                link.hoverClass,
                pathname === link.href && "text-chalk-yellow",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex h-11 items-center gap-2 rounded-xl border-2 border-dashed border-foreground/25 bg-surface/70 px-3 text-sm font-semibold text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-chalk-blue/70 hover:text-foreground sm:h-9"
          >
            <GitHubIcon className="h-4 w-4" />
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-dashed border-foreground/25 bg-surface/70 text-muted-foreground transition-colors hover:border-chalk-yellow/60 hover:text-foreground md:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Chalk tray */}
      <div
        className="pointer-events-none absolute inset-x-0 -bottom-[3px] mx-auto flex h-2 w-full max-w-7xl items-center justify-end gap-1 overflow-hidden px-6 sm:px-9"
        aria-hidden="true"
      >
        {CHALK_PIECES.map((color, index) => (
          <span
            key={color}
            className={cn(
              "h-1.5 w-7 rounded-full opacity-70",
              color,
              index % 2 === 0 ? "rotate-1" : "-rotate-2",
            )}
          />
        ))}
      </div>

      {open ? (
        <nav
          id="mobile-navigation"
          aria-label="Mobile"
          className="border-t-2 border-dashed border-foreground/15 bg-surface/95 px-5 py-3 backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-3 py-3 font-display text-base tracking-wide text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
