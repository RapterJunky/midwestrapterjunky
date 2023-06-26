/// <reference types="cypress" />
import { isMobile } from '../../../support/utils';

describe("Comments", () => {
    it("Login with Google", () => {
        const usr = Cypress.env("GOOGLE_USER");
        const psd = Cypress.env("GOOGLE_PW");
        const url = Cypress.env("SITE_NAME");
        const cookieName = Cypress.env("COOKIE_NAME");
        const opts = {
            username: usr,
            password: psd,
            loginUrl: url,
            headless: true,
            logs: false,
            isPopup: true,
            loginSelector: `a[href="${Cypress.env("SITE_NAME")}/api/auth/signin/google"]`,
            postLoginSelector: ".unread-count"
        }

        return cy.task("GoogleSocialLogin", opts)
            .then(({ cookies }) => {
                cy.clearCookies();
                const cookie = cookies
                    .filter((cookie) => cookie.name === cookieName)
                    .pop()
                if (cookie) {
                    cy.setCookie(cookie.name, cookie.value, {
                        domain: cookie.domain,
                        expiry: cookie.expires,
                        httpOnly: cookie.httpOnly,
                        path: cookie.path,
                        secure: cookie.secure,
                    })

                    Cypress.Cookies.defaults({
                        preserve: cookieName,
                    })
                }

            })

    });
    it("Creates a comment on a post", () => {

    });
    it("Likes a comment", () => {

    });
    it("Unlikes a comment", () => {

    });
    it("Flags a comment", () => {

    });
    it("Edits a comment", () => {

    });
    it("Deletes a comment", () => {

    });
});