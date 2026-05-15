import tailwindcssAnimate from "tailwindcss-animate"

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['"Geist Mono Variable"', "ui-monospace", "monospace"],
        mono: ['"Geist Mono Variable"', "ui-monospace", "monospace"],
        display: ['"Asimovian"', '"Geist Mono Variable"', "ui-monospace", "monospace"],
      },
      fontSize: {
        "display-2xl": [
          "clamp(2.75rem, 6vw, 5rem)",
          { lineHeight: "1.05", letterSpacing: "-0.03em" },
        ],
        "display-xl": [
          "clamp(2.25rem, 5vw, 4rem)",
          { lineHeight: "1.1", letterSpacing: "-0.025em" },
        ],
        "display-lg": [
          "clamp(1.875rem, 4vw, 3rem)",
          { lineHeight: "1.15", letterSpacing: "-0.02em" },
        ],
        "headline-lg": ["1.875rem", { lineHeight: "1.25" }],
        "headline-md": ["1.5rem", { lineHeight: "1.3" }],
        "headline-sm": ["1.25rem", { lineHeight: "1.4" }],
        "body-lg": ["1.125rem", { lineHeight: "1.65" }],
        "body-md": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
