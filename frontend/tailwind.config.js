/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0e14",
          900: "#0f1420",
          850: "#131a28",
          800: "#182031",
          700: "#232d42",
          600: "#324158",
          500: "#4b5b76",
          400: "#7382a1",
          300: "#9aa7c2",
          200: "#c3cbdf",
          100: "#e5e9f2",
        },
        brand: {
          200: "#b6f7ea",
          300: "#8ef2dd",
          400: "#5eead4",
          500: "#2dd4bf",
          600: "#14b8a6",
        },
        accent: {
          200: "#c7ccf9",
          300: "#a5abf5",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(94,234,212,0.15), 0 8px 30px rgba(0,0,0,0.35)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseDot: {
          "0%, 80%, 100%": { transform: "scale(0.6)", opacity: 0.4 },
          "40%": { transform: "scale(1)", opacity: 1 },
        },
        currentFlow: {
          "0%": { transform: "translateY(-120%)", opacity: 0 },
          "15%": { opacity: 1 },
          "85%": { opacity: 1 },
          "100%": { transform: "translateY(420%)", opacity: 0 },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.35s ease-out",
        pulseDot: "pulseDot 1.2s infinite ease-in-out",
        currentFlow: "currentFlow 1.1s linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
