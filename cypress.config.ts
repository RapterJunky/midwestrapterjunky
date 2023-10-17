//import { plugin } from "./cypress/plugins/index";
import { defineConfig } from "cypress";

//https://learn.cypress.io/tutorials/writing-end-to-end-tests-with-cypress

export default defineConfig({
  env: {},
  e2e: {
    //chromeWebSecurity: false,
    experimentalRunAllSpecs: true,
    //setupNodeEvents: plugin,
    specPattern: "cypress/e2e/**/*.spec.ts",
    supportFile: "cypress/support/e2e.ts",
    baseUrl: "http://localhost:3000",
    viewportHeight: 1000,
    viewportWidth: 1280,
  },
  component: {
    specPattern: "src/**/*.cy.tsx",
    supportFile: "cypress/support/component.ts",
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
  },
});