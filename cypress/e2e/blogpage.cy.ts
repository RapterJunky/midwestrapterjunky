/// <reference types="cypress" />

describe("Navigation",()=>{
    context("Desktop 1080p resolution",()=>{
        beforeEach(()=>cy.viewport(1920,1080));
    });

    context("iphone-7 resolution",()=>{
        beforeEach(()=>cy.viewport("iphone-7"));
    });
});