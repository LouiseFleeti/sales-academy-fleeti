import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fleeti: {
          blue: "#0ca2c2",
          orange: "#fea706",
          "blue-dark": "#0887a3",
          "blue-light": "#e8f7fa",
          "orange-light": "#fff7e6",
        },
      },
      fontFamily: {
        raleway: ["Raleway", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
