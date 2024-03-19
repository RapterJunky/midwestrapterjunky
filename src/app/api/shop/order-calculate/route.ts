import createHttpError from "http-errors";
import { NextResponse, type NextRequest } from "next/server";
import {
  Client,
  type ApiResponse,
  type CalculateOrderResponse,
  type OrderLineItem,
} from "square";
import { serialize } from "superjson";
import { z } from "zod";
import onError from "@/lib/api/handleError";
import ratelimit from "@/lib/api/rateLimit";
import { logger } from "@/lib/logger";

const schema = z.object({
  location_id: z.string().nonempty("Missing location id"),
  customer_id: z.string().optional(),
  order: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.coerce
          .string()
          .max(12)
          .min(1)
          .refine((arg) => arg !== "0", {
            message: "Quantity should not be 0",
          }),
      }),
    )
    .nonempty("Order needs at most 1 item."),
  discounts: z.array(
    z.object({
      id: z.string(),
      scope: z.literal("ORDER"),
    }),
  ),
});

export async function POST(request: NextRequest) {
  try {
    const result = await ratelimit(request.ip);
    if (!result.success) throw createHttpError.TooManyRequests();

    const body = await request.json();

    const { location_id, customer_id, order, discounts } = schema.parse(body);

    const client = new Client({
      accessToken: process.env.SQAURE_ACCESS_TOKEN,
      environment: process.env.SQUARE_MODE,
    });

    const lineItems: OrderLineItem[] = order.map((value) => ({
      catalogObjectId: value.id,
      quantity: value.quantity,
    }));

    const response = await client.ordersApi
      .calculateOrder({
        order: {
          locationId: location_id,
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
      })
      .catch((error) => error as ApiResponse<CalculateOrderResponse>);

    if ("errors" in response.result) {
      logger.error(response.result.errors);
      throw createHttpError.InternalServerError();
    }

    const { json } = serialize(response.result.order);

    return NextResponse.json(json);
  } catch (error) {
    return onError(error);
  }
}
