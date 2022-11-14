/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    './node_modules/tw-elements/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      spacing: {
        "1/7": "14.26%"
      },
      colors: {
        olive: "#627647"
      }
    },
  },
  plugins: [
    require('tw-elements/dist/plugin')
  ],
}
