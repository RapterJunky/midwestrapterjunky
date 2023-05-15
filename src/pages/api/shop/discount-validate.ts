import type { NextApiRequest, NextApiResponse } from "next";
import { Client, type Environment } from "square";
import createHttpError from "http-errors";
import { z } from "zod";

import { PUBLIC_CACHE_FOR_2H } from "@lib/revaildateTimings";
import { applyRateLimit } from "@lib/api/rateLimiter";
import { handleError } from "@lib/api/errorHandler";
import { logger } from "@lib/logger";

const schema = z.object({
  discount: z.string(),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") throw createHttpError.MethodNotAllowed();
    await applyRateLimit(req, res);
    const { discount } = schema.parse(req.query);

    const client = new Client({
      accessToken: process.env.SQAURE_ACCESS_TOKEN,
      environment: process.env.SQUARE_MODE as Environment,
    });

    const response = await client.catalogApi.searchCatalogObjects({
      objectTypes: ["DISCOUNT"],
      includeDeletedObjects: false,
      query: {
        textQuery: {
          keywords: discount.split(" "),
        },
      },
      limit: 1,
    });

    if ("errors" in response.result) {
      logger.error(response.result.errors);
      throw new createHttpError.InternalServerError("Provider Error");
    }

    if (!response.result?.objects || !response.result.objects[0])
      return res.status(404).json(null);

    const { id, discountData } = response.result.objects[0];

    if (!(req.draftMode || req.preview) && process.env.VERCEL_ENV !== "development")
      res.setHeader("Cache-Control", PUBLIC_CACHE_FOR_2H);

    return res.status(200).json({
      id,
      name: discountData?.name,
    });
  } catch (error) {
    handleError(error, res);
  }
}
