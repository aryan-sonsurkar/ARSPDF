import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        elevated: "hsl(var(--elevated))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
        },
        success: "hsl(var(--success))",
        destructive: "hsl(var(--destructive))",
        ring: "hsl(var(--ring))",
        chalk: {
          yellow: "hsl(var(--chalk-yellow))",
          pink: "hsl(var(--chalk-pink))",
          blue: "hsl(var(--chalk-blue))",
          green: "hsl(var(--chalk-green))",
          orange: "hsl(var(--chalk-orange))",
          purple: "hsl(var(--chalk-purple))",
        },
        paper: {
          DEFAULT: "hsl(var(--paper))",
          ink: "hsl(var(--paper-ink))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "ui-sans-serif", "sans-serif"],
        accent: ["var(--font-accent)", "var(--font-display)", "cursive"],
        marker: ["var(--font-marker)", "var(--font-display)", "cursive"],
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--primary) / 0.2), 0 20px 60px -24px hsl(var(--primary) / 0.45)",
        card: "0 24px 50px -34px rgba(0, 0, 0, 0.95)",
        sticky: "0 14px 26px -14px rgba(0, 0, 0, 0.75), 0 3px 8px -4px rgba(0, 0, 0, 0.5)",
        chalkboard:
          "0 30px 60px -30px rgba(0, 0, 0, 0.9), 0 1px 0 hsl(0 0% 100% / 0.05) inset",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(var(--tilt, 0deg))" },
          "50%": { transform: "translateY(-10px) rotate(var(--tilt, 0deg))" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2.5deg)" },
          "50%": { transform: "rotate(2.5deg)" },
        },
        jiggle: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px) rotate(-1deg)" },
          "75%": { transform: "translateX(2px) rotate(1deg)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(14px,-18px,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.92) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 6s ease-in-out infinite",
        wiggle: "wiggle 2.6s ease-in-out infinite",
        jiggle: "jiggle 0.4s ease-in-out infinite",
        blink: "blink 1.1s step-end infinite",
        drift: "drift 12s ease-in-out infinite",
        marquee: "marquee 26s linear infinite",
        "pop-in": "pop-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
