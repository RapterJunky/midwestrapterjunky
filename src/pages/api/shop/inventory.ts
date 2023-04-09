import type { NextApiRequest, NextApiResponse } from "next";
import { Client, type Environment } from "square";
import createHttpError from "http-errors";
import { z } from "zod";

import { handleError } from "@/lib/api/errorHandler";
import { logger } from "@/lib/logger";
import { PUBLIC_CACHE_FOR_1H } from "@/lib/revaildateTimings";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") throw createHttpError.MethodNotAllowed();
    const id = z.string().parse(req.query.item);

    const client = new Client({
      accessToken: process.env.SQAURE_ACCESS_TOKEN,
      environment: process.env.SQUARE_MODE as Environment,
    });

    const item = await client.inventoryApi.retrieveInventoryCount(id);

    if ("errors" in item.result) {
      logger.error(item.result.errors);
      throw createHttpError.InternalServerError();
    }

    if (!("counts" in item.result)) {
      return res.status(200).json([]);
    }

    if (!req.preview || process.env.VERCEL_ENV !== "development")
      res.setHeader("Cache-Control", PUBLIC_CACHE_FOR_1H);

    return res.status(200).json(item.result.counts);
  } catch (error) {
    handleError(error, res);
  }
}
