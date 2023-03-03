import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    experimentalRunAllSpecs: true,
    baseUrl: "https://midwestrapterjunky-rapterjunky.vercel.app",
    setupNodeEvents(on, config) {

      // implement node event listeners here
    },
  },
});
