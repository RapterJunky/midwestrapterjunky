import { defineConfig } from "cypress";

export default defineConfig({
  env: {
    apiUrl: "http://localhost:3001",
    mobileViewportWidthBreakpoint: 414,
    codeCoverage: {
      url: "http://localhost:3001/__coverage__",
      exclude: "cypress/**/*.*",
    }
  },
  e2e: {
    experimentalRunAllSpecs: true,
    specPattern: "cypress/e2e/**/*.spec.ts",
    supportFile: "cypress/support/e2e.ts",
    baseUrl: "http://localhost:3000",
    viewportHeight: 1000,
    viewportWidth: 1280,
    setupNodeEvents(on, config) {

      // implement node event listeners here
    },
  },
});
