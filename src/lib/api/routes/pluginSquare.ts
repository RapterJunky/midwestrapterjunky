import type { NextApiRequest, NextApiResponse } from "next";
import { Client, Environment } from "square";
import { serialize } from "superjson";
import createHttpError from "http-errors";
import { z } from "zod";

import { applyRateLimit } from "@lib/api/rateLimiter";

const modeQuery = z.enum(["item", "list"]).describe("Type of request");

const request = z.object({
  token: z.string().nonempty().describe("Auth token"),
  sandbox: z
    .boolean()
    .describe("Is this request to be in sandbox mode")
    .transform((arg) => (arg ? Environment.Sandbox : Environment.Production)),
});

const searchRequest = z.object({
  search: z.string().describe("Search query"),
});
const fetchItem = z.object({
  id: z.string().nonempty().describe("Id of product to fetch"),
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
  await applyRateLimit(req, res);

  const mode = modeQuery.parse(req.query.mode);
  const { token, sandbox } = request.parse(req.body);

  const client = new Client({
    accessToken: token,
    environment: sandbox,
  });

  if (mode === "list") {
    const { search } = searchRequest.parse(req.body);
    const objects = await client.catalogApi.searchCatalogObjects({
      limit: 10,
      includeDeletedObjects: false,
      includeRelatedObjects: true,
      objectTypes: ["ITEM"],
      query: search.length
        ? {
            textQuery: {
              keywords: search.split(" "),
            },
          }
        : undefined,
    });

    const { json } = serialize(objects.result);

    return res.status(200).json(json);
  }

  const { id } = fetchItem.parse(req.body);

  const item = await client.catalogApi.retrieveCatalogObject(id, true);

  const { json } = serialize(item.result);

  return res.status(200).json(json);
};

export default handle;
