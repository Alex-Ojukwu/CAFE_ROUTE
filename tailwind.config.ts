import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand amber/orange — CTAs, accents, focus.
        primary: {
          50: "#FCF1E9",
          100: "#F9E0CC",
          200: "#F3BE97",
          300: "#EE9C63",
          400: "#EC8038",
          500: "#EA6A1F",
          600: "#CE561A",
          700: "#A23F14",
          800: "#76300F",
          900: "#4E2009",
          DEFAULT: "#EA6A1F",
        },
        // Warm near-black charcoal page + raised areas.
        background: {
          DEFAULT: "#15110D",
          raised: "#1E1812",
        },
        // Cards / framed sections + their warm border.
        surface: {
          DEFAULT: "#241D16",
          border: "#3A2F24",
        },
        // Text: warm off-white body, muted tan secondary.
        ink: {
          DEFAULT: "#F5EEE6",
          muted: "#A89A88",
        },
        // Positive / success moments.
        success: "#4FB06A",
        // Warm cream — the "everyday specials" pop-out cards that sit bright
        // against the dark canvas. Dark text (text-background) rides on this.
        cream: {
          DEFAULT: "#F3E9DA",
          dark: "#E4D3BA", // borders / inner shadows on cream
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(234,106,31,0.25), 0 18px 40px -20px rgba(234,106,31,0.45)",
        card: "0 12px 30px -18px rgba(0,0,0,0.7)",
      },
      dropShadow: {
        // Lifts a cut-out dish off the card so it reads as "popping out".
        pop: ["0 18px 18px rgba(0,0,0,0.35)", "0 6px 8px rgba(0,0,0,0.25)"],
        "pop-sm": "0 10px 12px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
