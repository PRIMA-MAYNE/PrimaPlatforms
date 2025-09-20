import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },

    extend: {
      colors: {
        // ———— BACKGROUND & TEXTURE ————
        background: "#fdfaf5",
        foreground: "#3a324a",
        border: "hsl(270 3% 91%)",
        card: "#fefefe",
        popover: "#fdfaf5",
        muted: "#f5f0ff",
        accent: "#9d88e6",
        "accent-foreground": "#1a152e",

        // ———— PRIMARY & SECONDARY ————
        primary: "#7ea4e8",
        "primary-foreground": "#1a152e",
        secondary: "#9d88e6",
        "secondary-foreground": "#1a152e",

        // ———— NEUTRAL PALETTE ————
        "neutral-50": "#fdfaf5",
        "neutral-100": "#fcf6f0",
        "neutral-200": "#f8f0e8",
        "neutral-300": "#f1e4dd",
        "neutral-400": "#e8d6cf",
        "neutral-500": "#d9c3be",
        "neutral-600": "#c7b1ad",
        "neutral-700": "#b29c97",
        "neutral-800": "#9d88e6",
        "neutral-900": "#3a324a",

        // ———— STATE COLORS ————
        destructive: "#e87a7a",
        "destructive-foreground": "#1a152e",
        success: "#8fd4a8",
        "success-foreground": "#1a152e",
        warning: "#f7c285",
        "warning-foreground": "#1a152e",
        info: "#a3c9f0",
        "info-foreground": "#1a152e",

        // ———— SIDEBAR ————
        sidebar: {
          DEFAULT: "rgba(253, 250, 245, 0.92)",
          foreground: "#3a324a",
          primary: "#9d88e6",
          "primary-foreground": "#1a152e",
          accent: "#7ea4e8",
          "accent-foreground": "#1a152e",
          border: "rgba(157, 136, 230, 0.1)",
          ring: "rgba(126, 164, 232, 0.15)",
        },

        // ———— CATALYST BRANDING ————
        catalyst: {
          50: "#fdfaf5",
          100: "#fbf4f0",
          200: "#f5e9e6",
          300: "#ebe0db",
          400: "#e0d1cc",
          500: "#d4c1bd",
          600: "#c1b0ac",
          700: "#a99aa4",
          800: "#9d88e6",
          900: "#3a324a",
        },

        // ✅ NEW: Add missing color for `from-cream-lavender`
        "cream-lavender": "#f5f0ff", // matches your `muted` color
      },

      fontFamily: {
        sans: ["Clash Display", "Inter", "system-ui", "sans-serif"],
        display: ["Cormorant Garamond", "Georgia", "serif"],
        mono: ["Fira Code", "Menlo", "monospace"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "2.5rem",
        full: "9999px",
      },

      spacing: {
        0.5: "0.125rem",
        1.5: "0.375rem",
        2.5: "0.625rem",
        3.5: "0.875rem",
        4.5: "1.125rem",
        5.5: "1.375rem",
        6.5: "1.625rem",
        7.5: "1.875rem",
        8.5: "2.125rem",
        9.5: "2.375rem",
        10.5: "2.625rem",
        11.5: "2.875rem",
        12.5: "3.125rem",
        13.5: "3.375rem",
        14.5: "3.625rem",
        15.5: "3.875rem",
      },

      boxShadow: {
        sm: "0 1px 3px rgba(157, 136, 230, 0.08)",
        DEFAULT: "0 4px 12px rgba(157, 136, 230, 0.07), 0 1px 4px rgba(126, 164, 232, 0.05)",
        md: "0 8px 24px rgba(157, 136, 230, 0.09), 0 2px 8px rgba(126, 164, 232, 0.06)",
        lg: "0 16px 48px rgba(157, 136, 230, 0.1), 0 4px 16px rgba(126, 164, 232, 0.08)",
        xl: "0 24px 64px rgba(157, 136, 230, 0.12), 0 6px 24px rgba(126, 164, 232, 0.1)",
        "soft-glow": "0 0 30px rgba(126, 164, 232, 0.08), inset 0 0 20px rgba(157, 136, 230, 0.05)",
        "floating": "0 12px 40px rgba(157, 136, 230, 0.1), 0 0 50px rgba(126, 164, 232, 0.04)",
        "card-hover": "0 10px 30px rgba(157, 136, 230, 0.12), 0 0 40px rgba(126, 164, 232, 0.06)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(126, 164, 232, 0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(126, 164, 232, 0.25)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "breath": {
          "0%, 100%": { opacity: "0.95" },
          "50%": { opacity: "0.98" },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.3s ease-out",
        "accordion-up": "accordion-up 0.3s ease-out",
        "fade-in": "fade-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "scale-in": "scale-in 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "float": "float 4s ease-in-out infinite",
        "breath": "breath 3s ease-in-out infinite",
        "ripple": "ripple 1.2s ease-out",
      },

      transitionProperty: {
        default: "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
        "all-slow": "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionTimingFunction: {
        "soft-ease": "cubic-bezier(0.16, 1, 0.3, 1)",
        "ease-in-slow": "cubic-bezier(0.42, 0, 0.58, 1)",
        "ease-out-slow": "cubic-bezier(0.33, 0, 0.67, 1)",
      },
      transitionDuration: {
        "slowest": "1000ms",
        "slower": "800ms",
        "slow": "600ms",
        "normal": "400ms",
        "fast": "200ms",
        "faster": "150ms",
      },

      screens: {
        xs: "320px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1400px",
        "3xl": "1600px",
        "4xl": "1920px",
      },

      lineHeight: {
        tight: "1.2",
        snug: "1.3",
        normal: "1.5",
        relaxed: "1.625",
        loose: "1.8",
      },
      letterSpacing: {
        tighter: "-0.02em",
        tight: "-0.01em",
        normal: "0",
        wide: "0.01em",
        wider: "0.02em",
        widest: "0.05em",
      },

      backgroundImage: {
        "gradient-purple-blue": "linear-gradient(135deg, #9d88e6 0%, #7ea4e8 100%)",
        "gradient-cream-lavender": "linear-gradient(180deg, #fdfaf5 0%, #f5f0ff 100%)",
        "gradient-fade-purple": "radial-gradient(circle at 20% 30%, #9d88e6 0%, transparent 60%)",
        "gradient-fade-blue": "radial-gradient(circle at 80% 70%, #7ea4e8 0%, transparent 60%)",
        "card-overlay": "linear-gradient(180deg, rgba(253, 250, 245, 0.9) 0%, rgba(253, 250, 245, 0.7) 100%)",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
} satisfies Config;
