const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--inter-font,'InterVariable')",...defaultTheme.fontFamily.sans]
      },
      textColor: {
        "var-accent": "var(--accent-color)",
        "var-light": "var(--light-body-color)"
      },
      borderColor: {
        "var-border": "var(--border-color)",
        "var-accent": "var(--accent-color)"
      },
      height: {
        "30": "7.5rem"/*120px*/
      },
      spacing: {
        "1/7": "14.26%"
      },
      colors: {
        olive: "#627647"
      }
    },
  },
  plugins: [
    require('tw-elements/dist/plugin'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ],
}
