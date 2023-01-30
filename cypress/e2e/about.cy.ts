/// <reference types="cypress" />

describe("Navigation",()=>{

    context("Desktop 1080p resolution",()=>{
       beforeEach(()=>{
            cy.viewport(1920,1080)
       });

        it("should naviage to the about page",()=>{
            cy.visit("/");
            cy.get('a[href*="about-us"]').click();
            cy.url().should("include","/about-us");
            cy.get("h1").contains("About");
        });
    });

    context("iphone-7 resolution",()=>{
        beforeEach(()=>{
            cy.viewport("iphone-7");
        });

        it("should navigate to the about page",()=>{
            cy.visit("/");
            cy.get("header>nav>div>button").should("contain.html","svg").click()
            cy.get('ul>li>a[href*="about-us"]').should("be.visible").click();
            cy.url().should("include","/about-us");
            cy.get("h1").contains("About");
        });

    });

});