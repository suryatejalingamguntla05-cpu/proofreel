import type { Config } from "tailwindcss";

/**
 * Design tokens for Proofreel.
 *
 * brand  — iris/indigo: the primary action colour
 * accent — mint: reserved for proof and verified states, never for actions
 * ink    — deep slate: the dark canvas and long-form text colour
 *
 * Keeping "proof" colour-separate from "action" colour is deliberate: a mint
 * chip always means evidence, an iris chip always means something you can click.
 */
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
          50: "#eef1ff",
          100: "#e0e5ff",
          200: "#c6cdff",
          300: "#a3a9ff",
          400: "#8380fb",
          500: "#6a5cf3",
          600: "#5a41e4",
          700: "#4c33c8",
          800: "#3f2ca2",
          900: "#372b80",
          950: "#241a4f",
        },
        accent: {
          50: "#e8fdf3",
          100: "#c9f9e1",
          200: "#96f1c7",
          300: "#5ce3ab",
          400: "#2bcc8f",
          500: "#12b077",
          600: "#089061",
          700: "#0a7250",
          800: "#0b5b41",
          900: "#0a4a36",
          950: "#032a1f",
        },
        ink: {
          50: "#f6f7fa",
          100: "#eceef4",
          200: "#d5d9e6",
          300: "#b0b7cd",
          400: "#8590ad",
          500: "#667090",
          600: "#515a76",
          700: "#424a60",
          800: "#2c3145",
          900: "#191c28",
          950: "#0c0e16",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["ui_monospace", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(12,14,22,0.04), 0 8px 24px -12px rgba(12,14,22,0.18)",
        lift: "0 2px 4px rgba(12,14,22,0.06), 0 20px 40px -20px rgba(12,14,22,0.28)",
        glow: "0 0 0 1px rgba(106,92,243,0.35), 0 18px 48px -18px rgba(106,92,243,0.55)",
      },
      backgroundImage: {
        mesh: "radial-gradient(60% 60% at 15% 10%, rgba(106,92,243,0.38) 0%, transparent 60%), radial-gradient(50% 50% at 85% 15%, rgba(43,204,143,0.28) 0%, transparent 60%), radial-gradient(60% 60% at 50% 100%, rgba(131,128,251,0.30) 0%, transparent 65%)",
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "iris-sweep": "linear-gradient(100deg, #5a41e4 0%, #6a5cf3 45%, #2bcc8f 100%)",
      },
      backgroundSize: {
        grid: "44px 44px",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out both",
        "slide-up": "slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "float-slow": "floatSlow 7s ease-in-out infinite",
        "pulse-slow": "pulse 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floatSlow: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
