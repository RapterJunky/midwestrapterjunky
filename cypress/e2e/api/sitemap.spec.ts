describe("sitemap", () => {
    it("should get the sites sitemap", () => {
        cy.request({
            url: "/sitemap.xml",
            method: "GET"
        }).as("request")

        cy.get("@request").its("status").should("eq", 200);
        cy.get("@request").its("headers").its("content-type").should("eq", "application/xml");
    });
});