import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sentio: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#1e6cff",
          600: "#1a5ce0",
          700: "#1447b8",
          800: "#0f3a8f",
          900: "#0a2966",
        },
        midnight: "#0f172a",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        display: ["var(--font-cabinet)", "var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

