/// <reference types="cypress" />

describe("Shop Page", () => {
    it("displays all 3 products on the home page", () => {
        cy.visit("/shop");

        cy.get('[data-cy="product-tag"]').eq(0).within(() => {
            cy.get('[data-cy="product-name"]').should("contain", "Test Item");
            cy.get('[data-cy="product-price"]').should("contain", "$10.00");
            cy.get('[data-cy="product-category"]').should("contain", "Test Category");
        });

        cy.get('[data-cy="product-tag"]').eq(1).within(() => {
            cy.get('[data-cy="product-name"]').should("contain", "Wird Price");
            cy.get('[data-cy="product-price"]').should("contain", "$5.99");
            cy.get('[data-cy="product-category"]').should("contain", "General");
        });

        cy.get('[data-cy="product-tag"]').eq(2).within(() => {
            cy.get('[data-cy="product-name"]').should("contain", "SomeOtherItem");
            cy.get('[data-cy="product-price"]').should("contain", "$3.99");
            cy.get('[data-cy="product-category"]').should("contain", "Test Category");
        });
    });



}); 