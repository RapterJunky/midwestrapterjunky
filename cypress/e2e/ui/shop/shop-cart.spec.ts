/// <reference types="cypress" />

describe("Shopping Cart", () => {
    it("users can add products to the cart", () => {
        cy.intercept("GET", /\/api\/shop\/catalog\?/).as("getCatalog");
        cy.intercept("GET", /\/api\/shop\/inventory\?item=\w+/).as("getInventroy");

        cy.visit("/shop");

        cy.wait("@getCatalog");

        cy.location("pathname").should("include", "/shop");

        cy.get('[data-cy="product-tag"]').eq(1).click();

        cy.wait("@getInventroy");
        cy.location("pathname").should("include", "/shop/product/");

        cy.get('[aria-label="Add to Cart"]').click();
        cy.get('[aria-label="Cart items: 1"]').contains("1");
    })
})
