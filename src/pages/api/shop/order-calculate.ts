import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { serialize } from "superjson";
import { Client } from "square";
import { z } from "zod";

import getPricingForVarable from "@lib/shop/getPricingForVarable";
import { handleError } from "@lib/api/errorHandler";
import { applyRateLimit } from "@lib/api/rateLimiter";
import { logger } from "@lib/logger";

const schema = z.object({
  checkout_id: z.string().uuid(),
  location_id: z.string().nonempty("Missing location id"),
  customer_id: z.string().optional(),
  order: z
    .array(
      z.object({
        catalogObjectId: z.string(),
        quantity: z.coerce
          .string()
          .max(12)
          .min(1)
          .refine((arg) => arg !== "0", {
            message: "Quantity should not be 0",
          }),
        pricingType: z.string(),
      })
    )
    .nonempty("Order needs at most 1 item."),
  discounts: z.array(
    z.object({
      catalogObjectId: z.string(),
      scope: z.literal("ORDER"),
    })
  ),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
    await applyRateLimit(req, res);
    const { checkout_id, location_id, customer_id, order, discounts } =
      schema.parse(req.body);

    const client = new Client({
      accessToken: process.env.SQAURE_ACCESS_TOKEN,
      environment: process.env.SQUARE_MODE,
    });

    const lineItems = await getPricingForVarable(client, order);

    const response = await client.ordersApi.calculateOrder({
      order: {
        locationId: location_id,
        referenceId: checkout_id,
        customerId: customer_id,
        lineItems,
        discounts,
        serviceCharges: [
          {
            name: "Provider Charge Persent",
            percentage: "2.9",
            calculationPhase: "TOTAL_PHASE",
          },
          {
            name: "Shipping",
            amountMoney: {
              amount: BigInt(500),
              currency: "USD",
            },
            calculationPhase: "TOTAL_PHASE",
          },
          {
            name: "Provider Charge Flat",
            amountMoney: {
              amount: BigInt(30),
              currency: "USD",
            },
            calculationPhase: "TOTAL_PHASE",
          },
        ],
        pricingOptions: {
          autoApplyDiscounts: true,
          autoApplyTaxes: true,
        },
      },
    });

    if ("errors" in response.result) {
      logger.error(response.result.errors);
      return res.status(500).json(response.result.errors);
    }

    const { json } = serialize(response.result.order);

    return res.status(200).json(json);
  } catch (error) {
    handleError(error, res);
  }
}
