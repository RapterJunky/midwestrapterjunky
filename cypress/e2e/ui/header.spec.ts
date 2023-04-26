/// <reference types="cypress" />
import { isMobile } from '../../support/utils';

describe("Header", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("links to the correct pages", () => {
        if (isMobile()) {
            cy.get('[data-cy="logo"]').click();
            cy.location("pathname").should("eq", "/");

            cy.get('[data-cy="mobile-nav-link"]').eq(0).should("contain", "Home").click();
            cy.location("pathname").should("eq", "/");

            cy.get('[data-cy="mobile-nav-link"]').eq(1).should("contain", "Blog").click();
            cy.location("pathname").should("eq", "/blog");

            cy.get('[data-cy="mobile-nav-link"]').eq(2).should("contain", "Threads").click();
            cy.location("pathname").should("eq", "/threads");

            cy.get('[data-cy="mobile-nav-link"]').eq(3).should("contain", "Sponsors").click();
            cy.location("pathname").should("eq", "/sponsors");

            cy.get('[data-cy="mobile-nav-link"]').eq(4).should("contain", "About Us").click();
            cy.location("pathname").should("eq", "/about-us");

            cy.get('[data-cy="mobile-nav-link"]').eq(5).should("contain", "Calendar").click();
            cy.location("pathname").should("eq", "/calendar");

            cy.get('[data-cy="mobile-nav-link"]').eq(6).should("contain", "Shop").click();
            cy.location("pathname").should("eq", "/shop");
        } else {
            cy.get('[data-cy="logo"]').click();
            cy.location("pathname").should("eq", "/");

            cy.get('[data-cy="desktop-nav-link"]').eq(0).should("contain", "Home").click();
            cy.location("pathname").should("eq", "/");

            cy.get('[data-cy="desktop-nav-link"]').eq(1).should("contain", "Blog").click();
            cy.location("pathname").should("eq", "/blog");

            cy.get('[data-cy="desktop-nav-link"]').eq(2).should("contain", "Threads").click();
            cy.location("pathname").should("eq", "/threads");

            cy.get('[data-cy="desktop-nav-link"]').eq(3).should("contain", "Sponsors").click();
            cy.location("pathname").should("eq", "/sponsors");

            cy.get('[data-cy="desktop-nav-link"]').eq(4).should("contain", "About Us").click();
            cy.location("pathname").should("eq", "/about-us");

            cy.get('[data-cy="desktop-nav-link"]').eq(5).should("contain", "Calendar").click();
            cy.location("pathname").should("eq", "/calendar");

            cy.get('[data-cy="desktop-nav-link"]').eq(6).should("contain", "Shop").click();
            cy.location("pathname").should("eq", "/shop");
        }
    });

});