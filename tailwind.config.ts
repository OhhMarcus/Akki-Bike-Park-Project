import type { Config } from "tailwindcss";

/**
 * AKKI design tokens. The brand gradient is a highlighter: primary buttons,
 * selected dates, availability bars, one word per headline, focus rings.
 * Everything else stays black, grey and off-white.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "1.5rem", lg: "2rem" },
      screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1280px", "2xl": "1280px" },
    },
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "6px",
      md: "6px",
      lg: "8px",
      xl: "10px",
      "2xl": "10px",
      full: "9999px",
    },
    extend: {
      colors: {
        ink: "#080808",
        card: { DEFAULT: "#141313", 2: "#1B1A1A", 3: "#222020" },
        line: { DEFAULT: "#2A2828", strong: "#3A3737" },
        fg: "#F2EFEA",
        muted: "#9A958F",
        brand: { purple: "#A85FA8", rose: "#C8829A", amber: "#EBB04A", sand: "#D8CF94", sky: "#6FB1C6" },
        state: { almost: "#EBB04A", closed: "#E5484D", full: "#6B6763", ok: "#6FB1C6" },
      },
      fontFamily: {
        display: ["var(--font-display)", "var(--font-cjk)", "Arial Narrow", "sans-serif"],
        sans: ["var(--font-sans)", "var(--font-cjk)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        grad: "linear-gradient(90deg,#A85FA8 0%,#C8829A 25%,#EBB04A 50%,#D8CF94 75%,#6FB1C6 100%)",
        "grad-v": "linear-gradient(180deg,#A85FA8 0%,#C8829A 25%,#EBB04A 50%,#D8CF94 75%,#6FB1C6 100%)",
        pattern: "url('/brand/pattern.svg')",
        "pattern-dim": "url('/brand/pattern-dim.svg')",
        hatch: "repeating-linear-gradient(135deg,rgba(229,72,77,.34) 0 5px,transparent 5px 10px)",
      },
      boxShadow: {
        lift: "0 18px 40px -18px rgba(0,0,0,.8)",
      },
      keyframes: {
        "fade-up": { from: { opacity: "0", translate: "0 8px" }, to: { opacity: "1", translate: "0 0" } },
        pulse2: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
        // `translate` (not `transform`) so the desktop sheet keeps its -translate-x/y-1/2 centring after the animation
        "sheet-in": { from: { translate: "0 16px", opacity: "0" }, to: { translate: "0 0", opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up .35s ease-out both",
        pulse2: "pulse2 1.8s ease-in-out infinite",
        "sheet-in": "sheet-in .22s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
