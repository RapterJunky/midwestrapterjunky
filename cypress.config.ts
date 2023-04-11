import { defineConfig } from "cypress";

//https://learn.cypress.io/tutorials/writing-end-to-end-tests-with-cypress
export default defineConfig({
  e2e: {
    chromeWebSecurity: false,
    experimentalRunAllSpecs: true,
    specPattern: "cypress/e2e/**/*.spec.ts",
    supportFile: "cypress/support/e2e.ts",
    baseUrl: "http://localhost:3000",
    viewportHeight: 1000,
    viewportWidth: 1280,
    setupNodeEvents(on, config) {

    },
  },
});
