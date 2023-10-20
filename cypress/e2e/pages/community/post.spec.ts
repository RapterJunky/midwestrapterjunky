describe("community/post.spec.ts", () => {
    it("should visit community post", () => {
        cy.visit("/community/post/SOME-ID");
    });
});