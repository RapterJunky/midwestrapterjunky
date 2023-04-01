import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";

import { handleError } from "@/lib/api/errorHandler";
import { getKeys } from "@lib/dynamic_keys";
import { logger } from "@/lib/logger";


interface SquareList {
    errors?: { category: string; code: string; detail: string; field: string; }[];
    objects?: { is_deleted: boolean, id: string; category_data: { name: string; } }[]
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "GET") throw createHttpError.MethodNotAllowed();

        const access_token = `${process.env.SHOP_ID}_SQAURE_ACCESS_TOKEN`;
        const mode = `${process.env.SHOP_ID}_SQAURE_MODE`;

        const keys = await getKeys([
            access_token,
            mode
        ]);

        if (!keys[mode] || !keys[access_token]) throw createHttpError.InternalServerError("Failed to get shop provider");

        const request = await fetch(`https://${keys[mode]}/v2/catalog/list?types=CATEGORY`, {
            headers: {
                "Square-Version": "2023-03-15",
                "Content-Type": "application/json",
                Authorization: `Bearer ${keys[access_token]}`
            },
        });

        const body = await request.json() as SquareList;

        if (!request.ok || "errors" in body) {
            logger.error(body, "Square API request error");
            throw createHttpError.InternalServerError(body?.errors?.at(0)?.code ?? "Internal Server Error");
        }

        if ("objects" in body) {
            return res.status(200).json(body.objects?.filter(item => !item.is_deleted).map(item => ({
                name: item.category_data.name,
                id: item.id
            })))
        }

        return res.status(200).json([]);
    } catch (error) {
        handleError(error, res);
    }
}