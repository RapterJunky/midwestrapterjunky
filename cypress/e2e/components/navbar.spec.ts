import { isMobile } from '../../support/utils';

describe("Test navbar", () => {
    beforeEach(() => {
        cy.visit("/");
    });

    it("open ", () => {
        if (isMobile()) {
            cy.get(`[data-cy="sidenav-btn"]`).click();
        }

    });

});