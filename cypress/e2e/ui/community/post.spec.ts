/// <reference types="cypress" />
import { isMobile } from '../../../support/utils';

describe("Posts", () => {
    beforeEach(() => {
        cy.visit("/community");
    })
    it("Creates a post", () => {

        cy.get('[data-cy="create-post"]').click();
        cy.location("pathname").should("have.value", "/community/create-topic");

        cy.get('[data-cy="post-title"]').type("Cypress test post");
        cy.get('[data-cy="post-category"]').select(0);
        cy.get('[data-cy="tag-input-field"]').type("Cypress{enter}");
        cy.get('[data-cy="post-notification"]').check();
        cy.get('[data-cy="text-editor-field"]').type(`Some text content to test post creation with cypress`);
        cy.get('[data-cy="post-submit"]').click();

        cy.location("pathname").should("include", `/community/p/`);
    });
    it("Flags a post", () => {

    });
    it("Like a post", () => {

    });
    it("Unlikes a post", () => {

    });
    it("Edits a post", () => {

    });
    it("Deletes a post", () => {

    });
});