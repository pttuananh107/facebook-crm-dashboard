import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#26C0BD",
          dark: "#1E9A97",
        },
        desert: {
          bg: "#FFFFFF",          // white main background
          text: "#052D24",        // Cactus Night — dark text on light bg
          border: "#26C0BD",      // Lagoon Bloom border
          gold: "#F2B609",        // Desert Glow — Warm badge
          "gold-dim": "#C99500",
          surface: "#F0FAFA",     // very light teal surface
          "surface-2": "#E8F9F9", // hover row background
        },
        cactus: {
          DEFAULT: "#26C0BD",     // Lagoon Bloom = primary accent
          dim: "#1E9A97",
          light: "#4CD4D1",
          pale: "#E8F5F5",        // Cold badge background
        },
        terracotta: {
          DEFAULT: "#C4511A",     // errors only
          dim: "#9E4115",
          light: "#D96830",
        },
        sage: {
          DEFAULT: "#26C0BD",     // border colour = Lagoon Bloom
          light: "#4CD4D1",
        },
        radiance: "#FFEF38",
        lagoon: "#26C0BD",        // Lagoon Bloom alias
        night: "#052D24",         // Cactus Night — header/sidebar bg
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "pulse-dot": "pulseDot 2s infinite",
        "slide-up": "slideUp 0.22s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateX(-50%) translateY(20px)" },
          to: { opacity: "1", transform: "translateX(-50%) translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
