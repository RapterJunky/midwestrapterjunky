
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export const plugin = async (on: (type: string, actions: object) => void, config: unknown) => {
    on("task", {
        async createPost() {

        }
    });
}