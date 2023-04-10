/// <reference types="cypress" />

describe("Shopping Cart", () => {
    it("users can add products to the cart", () => {
        cy.visit("/shop");
        cy.get('[data-cy="product-tag"]').eq(0).click();
        cy.get('[aria-label="Add to Cart"]').click();
        cy.get('[aria-label="Cart items: 1"]').contains("1");
    })
})
