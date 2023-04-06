import createHttpError from "http-errors";
import { Client, Environment } from "square";
import { serialize } from "superjson";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from 'zod';
import { handleError } from "@/lib/api/errorHandler";
import { logger } from "@/lib/logger";
import { applyRateLimit } from "@/lib/api/rateLimiter";

const schema = z.object({
    checkout_id: z.string().uuid(),
    location_id: z.string(),
    customer_id: z.string().optional(),
    order: z.array(z.object({
        name: z.string(),
        catalogObjectId: z.string(),
        quantity: z.number().min(1).transform(value => value.toString()),
        basePriceMoney: z.object({
            amount: z.coerce.bigint(),
            currency: z.string()
        })
    })).nonempty(),
    discounts: z.array(z.object({
        catalogObjectId: z.string(),
        scope: z.literal("ORDER")
    }))
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
        await applyRateLimit(req, res);
        const { checkout_id, location_id, customer_id, order, discounts } = schema.parse(req.body);

        const client = new Client({
            accessToken: process.env.SQAURE_ACCESS_TOKEN,
            environment: process.env.SQUARE_MODE as Environment
        });

        const response = await client.ordersApi.calculateOrder({
            order: {
                locationId: location_id,
                referenceId: checkout_id,
                customerId: customer_id,
                lineItems: order,
                discounts,
                serviceCharges: [
                    {
                        name: "Shipping",
                        amountMoney: {
                            amount: BigInt(500),
                            currency: "USD"
                        },
                        calculationPhase: "TOTAL_PHASE"
                    }
                ],
                pricingOptions: {
                    autoApplyDiscounts: true,
                    autoApplyTaxes: true
                }
            }
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