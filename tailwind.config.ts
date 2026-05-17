import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F0B0A",
        vinyl: "#1A1614",
        vinylShine: "#3D332E",
        groove: "rgba(255, 235, 200, 0.04)",
        miraWarm: "#FFB89E",
        miraCool: "#A78BC9",
        text: "#E8E0D4",
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        serif: ["ui-serif", "Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
