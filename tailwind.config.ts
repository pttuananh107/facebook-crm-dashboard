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
          DEFAULT: "#8B6914",
          dark: "#6B5010",
        },
        desert: {
          bg: "#1C1F1A",
          text: "#E8DCC8",
          border: "#3D4A35",
          gold: "#8B6914",
          "gold-dim": "#6B5010",
          surface: "#252820",
          "surface-2": "#2E3228",
        },
        cactus: {
          DEFAULT: "#4A7C59",
          dim: "#3A6247",
          light: "#5E9970",
        },
        terracotta: {
          DEFAULT: "#C4511A",
          dim: "#9E4115",
          light: "#D96830",
        },
        sage: {
          DEFAULT: "#3D4A35",
          light: "#4E5E44",
        },
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
