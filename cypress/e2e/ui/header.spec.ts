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

            cy.get('[data-cy="mobile-nav-link"]').eq(0).should("contain", "home").click();
            cy.location("pathname").should("eq", "/");

            cy.get('[data-cy="mobile-nav-link"]').eq(1).should("contain", "blog").click();
            cy.location("pathname").should("eq", "/blog");

            cy.get('[data-cy="mobile-nav-link"]').eq(2).should("contain", "threads").click();
            cy.location("pathname").should("eq", "/threads");

            cy.get('[data-cy="mobile-nav-link"]').eq(3).should("contain", "sponsors").click();
            cy.location("pathname").should("eq", "/sponsors");

            cy.get('[data-cy="mobile-nav-link"]').eq(4).should("contain", "about us").click();
            cy.location("pathname").should("eq", "/about-us");

            cy.get('[data-cy="mobile-nav-link"]').eq(5).should("contain", "Calendar").click();
            cy.location("pathname").should("eq", "/calendar");

            cy.get('[data-cy="mobile-nav-link"]').eq(6).should("contain", "Shop").click();
            cy.location("pathname").should("eq", "/shop");
        } else {
            cy.get('[data-cy="logo"]').click();
            cy.location("pathname").should("eq", "/");

            cy.get('[data-cy="desktop-nav-link"]').eq(0).should("contain", "home").click();
            cy.location("pathname").should("eq", "/");

            cy.get('[data-cy="desktop-nav-link"]').eq(1).should("contain", "blog").click();
            cy.location("pathname").should("eq", "/blog");

            cy.get('[data-cy="desktop-nav-link"]').eq(2).should("contain", "threads").click();
            cy.location("pathname").should("eq", "/threads");

            cy.get('[data-cy="desktop-nav-link"]').eq(3).should("contain", "sponsors").click();
            cy.location("pathname").should("eq", "/sponsors");

            cy.get('[data-cy="desktop-nav-link"]').eq(4).should("contain", "about us").click();
            cy.location("pathname").should("eq", "/about-us");

            cy.get('[data-cy="desktop-nav-link"]').eq(5).should("contain", "Calendar").click();
            cy.location("pathname").should("eq", "/calendar");

            cy.get('[data-cy="desktop-nav-link"]').eq(6).should("contain", "Shop").click();
            cy.location("pathname").should("eq", "/shop");
        }
    });

});