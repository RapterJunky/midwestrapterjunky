const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      transitionDuration: {
        inherit: "inherit",
      },
      gap: {
        "dato-s": "var(--spacing-s)",
        "dato-m": "var(--spacing-m)",
        "dato-l": "var(--spacing-l)",
        "dato-xl": "var(--spacing-xl)",
        "dato-xxl": "var(--spacing-xxl)",
        "dato-xxxl": "var(--spacing-xxxl)",
      },
      margin: {
        "dato-s": "var(--spacing-s)",
        "dato-m": "var(--spacing-m)",
        "dato-l": "var(--spacing-l)",
        "dato-xl": "var(--spacing-xl)",
        "dato-xxl": "var(--spacing-xxl)",
        "dato-xxxl": "var(--spacing-xxxl)",
      },
      padding: {
        "dato-s": "var(--spacing-s)",
        "dato-m": "var(--spacing-m)",
        "dato-l": "var(--spacing-l)",
        "dato-xl": "var(--spacing-xl)",
        "dato-xxl": "var(--spacing-xxl)",
        "dato-xxxl": "var(--spacing-xxxl)",
      },
      colors: {
        "dato-dark": "var(--dark-color)",
        "dato-light": "var(--light-color)",
        "dato-light-bg": "var(--light-bg-color)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    require("@headlessui/tailwindcss"),
  ],
};
