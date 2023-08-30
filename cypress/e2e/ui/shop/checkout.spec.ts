import { getIframeBody } from "../../../support/utils";
describe("Checkout Process", () => {
    beforeEach(() => {
        cy.fixture("cart.json").then((cart) => {
            window.localStorage.setItem("cart", JSON.stringify(cart));
        })
    });

    it("Checks out with with no errors", () => {
        cy.intercept("GET", /https:\/\/pci-connect.squareupsandbox.com\/payments\/hydrate?\w+/).as("squareEmbbed");
        cy.visit(`/shop/checkout?checkoutId=${crypto.randomUUID()}`);

        // customer information
        cy.get('[data-cy="user-checkout-type"]').eq(1).click();

        cy.get('[data-cy="user-recipet-email"]').type("midwestraptorjunkies@gmail.com");

        cy.get('[data-cy="checkout-as-guest"]').click();

        cy.get('[data-cy="shipping-firstname-input"]').type("John");
        cy.get('[data-cy="shipping-lastname-input"]').type("Doe");
        cy.get('[data-cy="shipping-address1-input"]').type("47789 CR. 45");
        cy.get('[data-cy="shipping-city-input"]').type("New York");
        cy.get('[data-cy="shipping-postal-input"]').type("38225");
        cy.get('[data-cy="shipping-phone-input"]').type("4657773177");
        cy.get('[data-cy="checkout-next"]').click();

        cy.wait("@squareEmbbed");

        cy.get('[data-cy="billing-card-details"][data-status="ready"]').within(() => {
            cy.fixture("card.json").then(card => {
                getIframeBody().find('#cardNumber').type(card.number);
                getIframeBody().find('#expirationDate').type(card.good_exp);
                getIframeBody().find('#cvv').type(card.good_cvv);
                getIframeBody().find('#postalCode').type(card.good_postal);
            });
        });


        cy.get('[data-cy="checkout-pay"]').click();

        cy.location("pathname", { timeout: 60_000 }).should("contain", "/confirmation");
    });


    it("Checks out with CVV error", () => {
        cy.intercept("GET", /https:\/\/pci-connect.squareupsandbox.com\/payments\/hydrate?\w+/).as("squareEmbbed");
        cy.intercept("POST", "/api/shop/order").as("order");
        cy.visit(`/shop/checkout?checkoutId=${crypto.randomUUID()}`);

        // customer information
        cy.get('[data-cy="user-checkout-type"]').eq(1).click();

        cy.get('[data-cy="user-recipet-email"]').type("midwestraptorjunkies@gmail.com");

        cy.get('[data-cy="checkout-as-guest"]').click();

        //shipping
        cy.get('[data-cy="shipping-firstname-input"]').type("John");
        cy.get('[data-cy="shipping-lastname-input"]').type("Doe");
        cy.get('[data-cy="shipping-address1-input"]').type("47789 CR. 45");
        cy.get('[data-cy="shipping-city-input"]').type("New York");
        cy.get('[data-cy="shipping-postal-input"]').type("38225");
        cy.get('[data-cy="shipping-phone-input"]').type("4657773177");
        cy.get('[data-cy="checkout-next"]').click();

        cy.wait("@squareEmbbed");

        cy.get('[data-cy="billing-card-details"][data-status="ready"]').within(() => {
            cy.fixture("card.json").then(card => {
                getIframeBody().find('#cardNumber').type(card.number);
                getIframeBody().find('#expirationDate').type(card.good_exp);
                getIframeBody().find('#cvv').type(card.bad_cvv);
                getIframeBody().find('#postalCode').type(card.good_postal);
            });
        });

        cy.get('[data-cy="checkout-pay"]').click();

        cy.wait("@order");

        cy.get('[data-cy="checkout-error-message"]').should("contain", "CVV value is invaild");

        cy.get('[data-cy="checkout-error-accept"]').click();
    });
});