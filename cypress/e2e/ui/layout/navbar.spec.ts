/// <reference types="cypress" />
import { isMobile } from '../../../support/utils';

describe("Test if navbar can navigate to given page", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("Can navigate to home", () => {
        cy.get(`[data-cy="desktop-nav-link"]`).eq(0).contains("home", { matchCase: false }).click();
        cy.location("pathname").should("eq", "/");
    });
    it("Can navigate to blog", () => {
        cy.get(`[data-cy="desktop-nav-link"]`).eq(1).contains("blog", { matchCase: false }).click();
        cy.location("pathname").should("eq", "/blog");
    });


});