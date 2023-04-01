import createHttpError from "http-errors";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from 'zod';
import { handleError } from "@/lib/api/errorHandler";
import { getKeys } from "@lib/dynamic_keys";
import { logger } from "@/lib/logger";

const schema = z.object({
    cursor: z.string().optional(),
    last: z.string().optional(),
    query: z.string().optional(),
    order: z.enum(["trending", "latest", "lth", "htl"]).optional(),
    category: z.string().optional(),
    merchent: z.string().optional()
});

interface SquareResponse {
    errors?: { category: string; code: string; detail: string; field: string; }[]
    cursor?: string;
    objects?: {
        id: string;
        item_data: {
            name: string;
            description: string;
            category_id?: string;
            variations: {
                id: string;
                item_variation_data: {
                    name: string;
                    sku: string;
                    price_money: {
                        amount: number;
                        currency: string;
                    }
                }
            }[]
            image_ids?: string[]
        }
    }[]
    related_objects?: ({
        type: "IMAGE"; id: string; image_data: { url: string; name: string; }
    } | { type: "CATEGORY", id: string; category_data: { name: string; } })[]
    latest_time?: string;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "GET") throw createHttpError.MethodNotAllowed();

        const { cursor, query, order, category, merchent, last } = schema.parse(req.query);

        const access_token = `${process.env.SHOP_ID}_SQAURE_ACCESS_TOKEN`;
        const mode = `${process.env.SHOP_ID}_SQAURE_MODE`;

        const keys = await getKeys([
            access_token,
            mode
        ]);

        if (!keys[mode] || !keys[access_token]) throw createHttpError.InternalServerError("Failed to get shop provider");

        const request = await fetch(`https://${keys[mode]}/v2/catalog/search`, {
            method: "POST",
            headers: {
                "Square-Version": "2023-03-15",
                "Content-Type": "application/json",
                Authorization: `Bearer ${keys[access_token]}`
            },
            body: JSON.stringify({
                include_deleted_objects: false,
                include_related_objects: true,
                limit: 15,
                object_types: [
                    "ITEM"
                ],
                cursor: cursor ? cursor : undefined,
                query: query || order || category || merchent ? {
                    exact_query: category ? {
                        attribute_name: "category_id",
                        attribute_value: category
                    } : undefined,
                    text_query: query ? {
                        keywords: [query]
                    } : undefined
                } : undefined
            })
        });

        const content = await request.json() as SquareResponse;

        if (!request.ok) {
            logger.error(content.errors);
            throw createHttpError.InternalServerError();
        }


        const items = [];

        if (!content?.objects) return res.status(200).json({ result: [], cursor: null });

        for (const item of content.objects) {

            const format = Intl.NumberFormat(undefined, {
                style: "currency",
                currency: item.item_data.variations.at(0)?.item_variation_data.price_money.currency ?? "USD"
            });

            let image = null;
            if (item.item_data?.image_ids && content?.related_objects) {
                const imageId = item.item_data.image_ids.at(0);
                const imageData = content.related_objects.find(value => value.id === imageId);
                if (imageData && imageData.type === "IMAGE") {
                    image = {
                        url: imageData.image_data.url,
                        alt: imageData.image_data.name
                    }
                }
            }

            let categoryName = null;
            if (item.item_data?.category_id && content?.related_objects) {
                const category = content.related_objects.find(value => value.id === item.item_data.category_id);
                if (category && category.type === "CATEGORY") {
                    categoryName = category.category_data.name;
                }
            }

            const data = {
                name: item.item_data.name,
                id: item.id,
                image,
                price: format.format((item.item_data.variations.at(0)?.item_variation_data.price_money.amount ?? 0) / 100),
                category: categoryName,
            };

            items.push(data);
        }

        // cursor === current
        // 

        return res.status(200).json({
            result: items,
            hasNextPage: Boolean(content?.cursor),
            nextCursor: content?.cursor ?? null,
        });
    } catch (error) {
        return handleError(error, res);
    }
}