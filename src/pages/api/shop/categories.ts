import type { NextApiRequest, NextApiResponse } from "next";
import { Client, Environment } from "square";
import createHttpError from "http-errors";
import { handleError } from "@/lib/api/errorHandler";

import { logger } from "@/lib/logger";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "GET") throw createHttpError.MethodNotAllowed();

        const client = new Client({
            accessToken: process.env.SQAURE_ACCESS_TOKEN,
            environment: process.env.SQUARE_MODE as Environment
        });

        const request = await client.catalogApi.listCatalog(undefined, "CATEGORY")


        if ("errors" in request.result) {
            logger.error(request.result, "Square API request error");
            throw createHttpError.InternalServerError(request.result?.errors?.at(0)?.code ?? "Internal Server Error");
        }

        if ("objects" in request.result) {
            return res.status(200).json(request.result.objects?.filter(item => !item.isDeleted).map(item => ({
                name: item.categoryData?.name,
                id: item.id
            })));
        }

        return res.status(200).json([]);
    } catch (error) {
        handleError(error, res);
    }
}