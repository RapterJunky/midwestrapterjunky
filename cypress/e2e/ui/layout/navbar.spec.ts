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

    it("Can navigate to sponsors", () => {
        cy.get(`[data-cy="desktop-nav-link"]`).eq(2).contains("sponsors", { matchCase: false }).click();
        cy.location("pathname").should("eq", "/sponsors");
    });
    it("Can navigate to about us", () => {
        cy.get(`[data-cy="desktop-nav-link"]`).eq(3).contains("about us", { matchCase: false }).click();
        cy.location("pathname").should("eq", "/about-us");
    });

    it("Can navigate to about us", () => {
        cy.get(`[data-cy="desktop-nav-link"]`).eq(4).contains("about us", { matchCase: false }).click();
        cy.location("pathname").should("eq", "/about-us");
    });

    it("Can navigate to calendar", () => {
        cy.get(`[data-cy="desktop-nav-link"]`).eq(5).contains("calendar", { matchCase: false }).click();
        cy.location("pathname").should("eq", "/calendar");
    });

    it("Can navigate to shop", () => {
        cy.get(`[data-cy="desktop-nav-link"]`).eq(6).contains("shop", { matchCase: false }).click();
        cy.location("pathname").should("eq", "/shop");
    });

});