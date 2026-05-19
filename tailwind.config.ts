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
          DEFAULT: "#F2B609",
          dark: "#C99500",
        },
        // Cactus Night — main bg / darkest surface
        desert: {
          bg: "#052D24",
          text: "#26C0BD",       // Lagoon Bloom
          border: "#0F4D3E",
          gold: "#F2B609",       // Desert Glow
          "gold-dim": "#C99500",
          surface: "#0A3D32",    // slightly lighter than bg
          "surface-2": "#0F4D3E",
        },
        // Cactus Vein green
        cactus: {
          DEFAULT: "#40BA85",
          dim: "#2E8A60",
          light: "#5DCCA0",
        },
        // Kept for error states only
        terracotta: {
          DEFAULT: "#C4511A",
          dim: "#9E4115",
          light: "#D96830",
        },
        // Border / divider dark teal-green
        sage: {
          DEFAULT: "#0F4D3E",
          light: "#1A5E4C",
        },
        // Desert Radiance — bright highlight yellow
        radiance: "#FFEF38",
        // Lagoon Bloom — alias for quick use
        lagoon: "#26C0BD",
        // Night — alias for solid dark backgrounds
        night: "#052D24",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "pulse-dot": "pulseDot 2s infinite",
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
      },
    },
  },
  plugins: [],
};

export default config;
