/// <reference types="cypress" />

describe("Navigation",()=>{
    context("Desktop 1080p resolution",()=>{
        beforeEach(()=>{
             cy.viewport(1920,1080);
        });
 
         it("should naviage to the Blog root page",()=>{
             cy.visit("http://localhost:3000/");
             cy.get('a[href*="blog"]').click();
             cy.url().should("include","/blog");
             cy.get("h1").contains("Latest");
         });

         it("should naviage to the Blog list page",()=>{
            cy.visit("http://localhost:3000/");
            cy.get('a[href*="blog"]').click();
            cy.url().should("include","/blog");
            cy.get("h1").contains("Latest");

            cy.get('a[href*="list"]').click();
            cy.url().should("include","/blog/list");
            cy.get("h1").contains("All Articles");
        });
     });
 
     context("iphone-7 resolution",()=>{
         beforeEach(()=>{
             cy.viewport("iphone-7");
         });
 
         it("should navigate to the Blog root Page",()=>{
             cy.visit("/");
             cy.get("header>nav>div>button").should("contain.html","svg").click()
             cy.get('ul>li>a[href*="blog"]').should("be.visible").click();
             cy.url().should("include","/blog");
             cy.get("h1").contains("Latest");
         });

         it("should navigate to the Blog list Page",()=>{
            cy.visit("/");
            cy.get("header>nav>div>button").should("contain.html","svg").click()
            cy.get('ul>li>a[href*="blog"]').should("be.visible").click();
            cy.url().should("include","/blog");
            cy.get("h1").contains("Latest");

            cy.get('a[href*="list"]').click();
            cy.url().should("include","/blog/list");
            cy.get("h1").contains("All Articles");
        });
 
     });
});