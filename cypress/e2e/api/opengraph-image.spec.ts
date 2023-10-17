describe("Opengraph image", () => {

    it("query twiiter image", () => {
        cy.request({
            url: "/twitter-image"
        }).as("request");

        cy.get("@request").its("status").should("eq", 200);
        cy.get("@request").its("headers").its("content-type").should("eq", "image/png");
    });

});