import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";

import { logger } from "@lib/logger";

const schema = z.record(
  z.object({
    id: z.number(),
    value: z.boolean(),
  }),
);

const CONFIG_ID = "08db4a5e-9da2-4f87-8127-177d185c01ae";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const env =
    process.env.VERCEL_ENV !== "production"
      ? "08db4a5e-9d88-41a5-8db1-d00b50df6630"
      : "08db4a5e-9d97-4083-8220-ec3b0deecce8";
  switch (req.method) {
    case "PUT": {
      const data = schema.parse(req.body);

      const results = await Promise.allSettled(
        Object.values(data).map(async (flag) => {
          const response = await fetch(
            `https://api.configcat.com/v1/environments/${env}/settings/${flag.id}/value`,
            {
              method: "PUT",
              body: JSON.stringify({
                value: flag.value,
              }),
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${process.env.CONFIG_CAT_MANAGEMENT}`,
              },
            },
          );

          if (!response.ok) throw response;
          return response;
        }),
      );

      for (const result of results) {
        if (result.status === "rejected") {
          logger.error(
            result.reason as unknown,
            (result.reason as Response).statusText,
          );
        }
      }

      return res.status(204).send("");
    }
    case "GET": {
      const response = await fetch(
        `https://api.configcat.com/v1/configs/${CONFIG_ID}/environments/${env}/values`,
        {
          headers: {
            Authorization: `Basic ${process.env.CONFIG_CAT_MANAGEMENT}`,
          },
        },
      );

      if (!response.ok) {
        logger.error(response, response.statusText);
        throw new Error("Failed to fetch feature flags");
      }
      const data = (await response.json()) as { settingValues: unknown };
      return res.status(200).json(data.settingValues);
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
}
