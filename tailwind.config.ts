import type { Config } from "tailwindcss";

// Extend the Config type to include safelist
interface ExtendedConfig extends Config {
  safelist?: string[];
}

const config: ExtendedConfig = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "border-cyan",
    "hover:shadow-cyan/20",
    "text-cyan",
    "text-darkCyan",
    "hover:text-lightCyan",
    "hover:bg-cyan",
    "hover:bg-darkCyan",
    "bg-mutedCyan",
  ],
  theme: {
    extend: {
      colors: {
        cyan: "#00C3CC", // Logo gradient top, secondary color
        lightCyan: "#E0F7FA", // Lighter variant for hover effects
        darkCyan: "#008B9C", // Darker variant for dark mode
        blue: {
          600: "#2563EB", // Logo gradient bottom, primary color
        },
        mutedCyan: "#E6F6FA", // Muted cyan for backgrounds (light mode)
      },
    },
  },
  plugins: [],
  darkMode: "class", // Enable dark mode with class
};

export default config;
