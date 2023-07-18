import type { NextApiRequest, NextApiResponse } from "next";
import { Client, ApiError } from "square";
import createHttpError from "http-errors";
import { randomUUID } from "node:crypto";
import { serialize } from "superjson";
import { z } from "zod";

import getPricingForVarable from "@lib/shop/getPricingForVarable";
import { applyRateLimit } from "@lib/api/rateLimiter";
import onError from "@api/handleError";
import { logger } from "@lib/logger";

const schema = z.object({
  location_id: z.string().nonempty(),
  customer_id: z.string().optional(),
  source_id: z.string().min(1).nonempty(),
  source_verification: z.string().min(1).nonempty(),
  checkout_id: z.string().uuid().min(1).max(45).nonempty(),
  items: z
    .array(
      z.object({
        pricingType: z.string(),
        catalogObjectId: z.string().max(192),
        quantity: z.coerce
          .string()
          .max(12)
          .min(1)
          .refine((arg) => arg !== "0", {
            message: "Quantity should not be 0",
          }),
      }),
    )
    .nonempty(),
  discounts: z.array(
    z.object({
      catalogObjectId: z.string(),
      scope: z.literal("ORDER"),
    }),
  ),
  email: z.string().email().max(255).nonempty(),
  address: z.object({
    billing_as_shipping: z.boolean(),
    shipping: z.object({
      firstname: z.string().max(100),
      lastname: z.string().max(100),
      address_line1: z.string(),
      address_line2: z.string().optional(),
      country: z.string(),
      postal: z.string().max(20),
      phone: z
        .string()
        .max(30)
        .regex(/[\d \-\+]+/),
      city: z.string(),
      state: z.string(),
      comments: z.string().optional(),
    }),
    billing: z
      .object({
        firstname: z.string().max(100),
        lastname: z.string().max(100),
        address_line1: z.string(),
        address_line2: z.string().optional(),
        country: z.string(),
        postal: z.string().max(20),
        phone: z
          .string()
          .max(30)
          .regex(/[\d \-\+]+/),
        city: z.string(),
        state: z.string(),
      })
      .optional(),
  }),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
    await applyRateLimit(req, res);

    const {
      email,
      items,
      checkout_id,
      location_id,
      source_id,
      source_verification,
      customer_id,
      discounts,
      address,
    } = schema.parse(req.body);

    const client = new Client({
      accessToken: process.env.SQAURE_ACCESS_TOKEN,
      environment: process.env.SQUARE_MODE,
    });

    const lineItems = await getPricingForVarable(client, items);

    const clientOrder = await client.ordersApi
      .createOrder({
        idempotencyKey: checkout_id,
        order: {
          source: {
            name: "Website",
          },
          fulfillments: [
            {
              type: "SHIPMENT",
              shipmentDetails: {
                shippingNote: address.shipping?.comments,
                recipient: {
                  displayName: `${address.shipping.firstname} ${address.shipping.lastname}`,
                  emailAddress: email,
                  phoneNumber: address.shipping.phone,
                  address: {
                    addressLine1: address.shipping.address_line1,
                    addressLine2: address.shipping.address_line2,
                    country: address.shipping.country,
                    postalCode: address.shipping.postal,
                    firstName: address.shipping.firstname,
                    lastName: address.shipping.lastname,
                    locality: address.shipping.city,
                    administrativeDistrictLevel1: address.shipping.state,
                  },
                },
              },
            },
          ],
          customerId: customer_id,
          locationId: location_id,
          lineItems,
          discounts: discounts,
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
      .catch((e) => {
        // instanceof does not seem to work, so flag this a type of `ApiError`
        if (e instanceof Error) {
          (e as Error & { isSqaureError: boolean }).isSqaureError = true;
        }
        throw e;
      });

    if (!clientOrder.result.order)
      throw createHttpError.InternalServerError("Failed to get order: 1");

    const { netAmountDueMoney, id: orderId } = clientOrder.result.order;

    if (!orderId || !netAmountDueMoney)
      throw createHttpError.InternalServerError("Failed to get order: 2");

    const billing = address.billing_as_shipping
      ? address.shipping
      : !address.billing
      ? address.shipping
      : address.billing;

    const payment = await client.paymentsApi
      .createPayment({
        // a new payment idemptencyKey should be created every time,
        // while order may stay the same since the order shount change by this time.
        idempotencyKey: randomUUID(),
        locationId: location_id,
        customerId: customer_id,
        sourceId: source_id,
        verificationToken: source_verification,
        orderId,
        autocomplete: true,
        amountMoney: netAmountDueMoney,
        buyerEmailAddress: email,
        shippingAddress: {
          addressLine1: address.shipping.address_line1,
          addressLine2: address.shipping.address_line2,
          country: address.shipping.country,
          postalCode: address.shipping.postal,
          firstName: address.shipping.firstname,
          lastName: address.shipping.lastname,
          locality: address.shipping.city,
          administrativeDistrictLevel1: address.shipping.state,
        },
        billingAddress: {
          addressLine1: billing.address_line1,
          addressLine2: billing?.address_line2,
          country: billing.country,
          postalCode: billing.postal,
          firstName: billing.firstname,
          lastName: billing.lastname,
          locality: billing.city,
          administrativeDistrictLevel1: billing.state,
        },
      })
      .catch((e) => {
        if (e instanceof Error) {
          (e as Error & { isSqaureError: boolean }).isSqaureError = true;
        }
        throw e;
      });

    if (!payment || !payment.result.payment)
      throw createHttpError.InternalServerError(
        "Failed to get payment data: 1",
      );
    const { receiptNumber, receiptUrl, totalMoney, status } =
      payment.result.payment;

    const data = {
      receiptNumber,
      receiptUrl,
      totalMoney,
      status,
    };

    const { json } = serialize(data);

    return res.status(200).json(json);
  } catch (error) {
    if (error instanceof ApiError || "isSqaureError" in (error as ApiError)) {
      logger.error(error, "Sqaure ApiError");
      return res.status((error as ApiError).statusCode).json({
        message: (error as ApiError).message,
        status: (error as ApiError).statusCode,
        details: (error as ApiError).errors,
      });
    }
    return onError(error, res);
  }
}
