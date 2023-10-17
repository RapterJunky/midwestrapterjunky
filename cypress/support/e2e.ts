// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands'
import { isMobile } from './utils';

beforeEach(() => {
    // cy.intercept middleware to remove 'if-none-match' headers from all requests
    // to prevent the server from returning cached responses of API requests
    cy.intercept({ url: "http://localhost:3000", middleware: true }, (req) => delete req.headers["if-none-match"]);

    // Throttle API responses for mobile testing to simulate real world condition
    if (isMobile()) cy.intercept({ url: "http://localhost:3000/**", middleware: true }, (req) => {
        req.on("response", (res) => {
            // Throttle the response to 1 Mbps to simulate a mobile 3G connection
            res.setThrottle(1000);
        });
    })
});