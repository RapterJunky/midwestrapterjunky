/// <reference types="cypress" />

export const isMobile = () => {
    return Cypress.config("viewportWidth") < Cypress.env("mobileViewportWidthBreakpoint");
};

export const getIframeDocument = () => {
    return cy.get('iframe').its('0.contentDocument').should('exist');
}

export const getIframeBody = () => {
    return getIframeDocument().its('body').should('not.be.undefined').then(cy.wrap);
}