import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from 'zod';
import { applyRateLimit } from "../rateLimiter";

const ProductionOrigin = "connect.squareup.com";
const SandboxOrigin = "connect.squareupsandbox.com";

const modeQuery = z.enum(["item", "list"]).describe("Type of request");

const request = z.object({
    token: z.string().nonempty().describe("Auth token"),
    sandbox: z.boolean().describe("Is this request to be in sandbox mode")
});

const searchRequest = request.extend({
    search: z.string().describe("Search query"),
});
const fetchItem = request.extend({
    id: z.string().nonempty().describe("Id of product to fetch"),
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
    const mode = modeQuery.parse(req.query.mode);
    await applyRateLimit(req, res);

    if (mode === "list") {
        const { token, search, sandbox } = searchRequest.parse(req.body);

        const request = await fetch(`https://${sandbox ? SandboxOrigin : ProductionOrigin}/v2/catalog/search`, {
            method: "POST",
            headers: {
                "Square-Version": "2023-03-15",
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                limit: 10,
                include_deleted_objects: false,
                include_related_objects: true,
                object_types: [
                    "ITEM"
                ],
                query: search.length ? {
                    text_query: {
                        keywords: [
                            search
                        ]
                    }
                } : undefined
            })
        });

        const body = await request.json();

        if (!request.ok) throw createHttpError.BadRequest(body?.errors.at(0).detail ?? "Failed Square API request.");

        return res.status(200).json(body);
    }

    const { token, id, sandbox } = fetchItem.parse(req.body);

    const request = await fetch(`https://${sandbox ? SandboxOrigin : ProductionOrigin}/v2/catalog/object/${id}?include_related_objects=true`, {
        headers: {
            "Square-Version": "2023-03-15",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const body = await request.json();

    if (!request.ok) throw createHttpError.BadRequest(body?.errors.at(0).detail ?? "Failed Square API request.")

    return res.status(200).json(body);
}

export default handle;