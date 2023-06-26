import { plugins } from 'cypress-social-logins';
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const plugin = async (on: Cypress.PluginEvents, config: Cypress.PluginConfigOptions) => {
    on("task", {
        GoogleSocialLogin: plugins.GoogleSocialLogin,
        FacebookSocialLogin: plugins.FacebookSocialLogin,
        async createPost() {

        }
    });
}