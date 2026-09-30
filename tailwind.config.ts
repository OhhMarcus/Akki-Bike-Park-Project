import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", md: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        ink: "#0d0d0e",
        graphite: { 950: "#111113", 900: "#17171a", 800: "#1f1f23", 700: "#2a2a30", 600: "#3a3a42" },
        bone: "#f2f0eb",
        silver: { DEFAULT: "#b8bcc4", dim: "#8b8f98" },
        trail: { green: "#5fb37c", blue: "#5b9bd5", black: "#e8e6e1" },
        signal: "#e5b93c",
        danger: "#e2665a",
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-cjk)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "var(--font-cjk)", "system-ui", "sans-serif"],
      },
      letterSpacing: { tightest: "-0.02em" },
    },
  },
  plugins: [],
};
export default config;
