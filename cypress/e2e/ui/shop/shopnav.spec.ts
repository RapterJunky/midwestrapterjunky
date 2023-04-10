/// <reference types="cypress" />

describe("Shop navbar", () => {
    it("links to the correct page", () => {
        cy.get('[data-cy="desktop-nav-link"]').should("contain", "Shop").click();
        cy.location("pathname").should("eq", "/shop");
    });

    it("the search bar returns the correct search results", () => {
        cy.get('[data-cy="shop-search-input"]').eq(0).type("SomeOther{enter}");

        cy.location("search").should("contain", "?query=SomeOther");


        cy.get('[data-cy="product-tag"]').eq(2).within(() => {
            cy.get('[data-cy="product-name"]').should("contain", "SomeOtherItem");
            cy.get('[data-cy="product-price"]').should("contain", "$3.99");
            cy.get('[data-cy="product-category"]').should("contain", "Test Category");
        });
    })
});