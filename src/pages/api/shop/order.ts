import createHttpError from "http-errors";
import { Client, Environment } from "square";
import { serialize } from "superjson";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from 'zod';
import { handleError } from "@/lib/api/errorHandler";
import { logger } from "@/lib/logger";
import { applyRateLimit } from "@/lib/api/rateLimiter";

const schema = z.object({
    location_id: z.string(),
    customer_id: z.string().optional(),
    source_id: z.string().min(1),
    checkout_id: z.string().uuid().min(1).max(45),
    order: z.array(z.object({
        name: z.string().max(512),
        catalogObjectId: z.string().max(192),
        quantity: z.coerce.string().max(12).min(1),
        /*basePriceMoney: z.object({
            amount: z.coerce.bigint(),
            currency: z.string()
        })*/
    })).nonempty(),
    discounts: z.array(z.object({
        catalogObjectId: z.string(),
        scope: z.literal("ORDER")
    })),
    details: z.object({
        user: z.enum(["account", "guest"]),
        email: z.string().email(),
        shipping_details: z.object({
            name: z.string().max(100),
            address_line1: z.string(),
            address_line2: z.string().optional(),
            country: z.string(),
            postal: z.string().max(20),
            phone: z.string().max(30).regex(/[\d \-\+]+/).optional(),
            city: z.string(),
            state: z.string(),
            comments: z.string().optional()
        }),
        billing: z.object({
            billing_as_shipping: z.boolean(),
            name: z.string().max(100),
            address: z.object({
                name: z.string().max(100),
                address_line1: z.string(),
                address_line2: z.string().optional(),
                country: z.string(),
                postal: z.string().max(20),
                phone: z.string().max(30).regex(/[\d \-\+]+/).optional(),
                city: z.string(),
                state: z.string(),
            }).optional()
        })
    }),
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
        await applyRateLimit(req, res);

        const order = schema.parse(req.body);

        const client = new Client({
            accessToken: process.env.SQAURE_ACCESS_TOKEN,
            environment: process.env.SQUARE_MODE as Environment
        });


        const clientOrder = await client.ordersApi.createOrder({
            idempotencyKey: order.checkout_id,
            order: {
                locationId: order.location_id,
                customerId: order.customer_id,
                discounts: order.discounts,
                lineItems: order.order,
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

        if (!clientOrder.result.order || !clientOrder.result.order?.id) {
            throw clientOrder.result.errors;
        }

        const payment = await client.paymentsApi.createPayment({
            sourceId: order.source_id,
            idempotencyKey: order.checkout_id,
            amountMoney: clientOrder.result.order.netAmountDueMoney!,
            customerId: order.customer_id,
            locationId: order.location_id,
            buyerEmailAddress: order.details.email,
            shippingAddress: {
                addressLine1: order.details.shipping_details.address_line1,
                addressLine2: order.details.shipping_details.address_line2,
                locality: order.details.shipping_details.city,
                administrativeDistrictLevel1: order.details.shipping_details.state,
                postalCode: order.details.shipping_details.postal,
                country: order.details.shipping_details.country,
                firstName: order.details.shipping_details.name
            },
            billingAddress: {
                addressLine1: !order.details.billing.billing_as_shipping ? order.details.billing.address?.address_line1 : order.details.shipping_details.address_line1,
                addressLine2: !order.details.billing.billing_as_shipping ? order.details.billing.address?.address_line2 : order.details.shipping_details.address_line2,
                locality: !order.details.billing.billing_as_shipping ? order.details.billing.address?.city : order.details.shipping_details.city,
                administrativeDistrictLevel1: !order.details.billing.billing_as_shipping ? order.details.billing.address?.state : order.details.shipping_details.state,
                postalCode: !order.details.billing.billing_as_shipping ? order.details.billing.address?.postal : order.details.shipping_details.postal,
                country: !order.details.billing.billing_as_shipping ? order.details.billing.address?.country : order.details.shipping_details.country,
                firstName: !order.details.billing.billing_as_shipping ? order.details.billing.address?.name : order.details.shipping_details.name
            }
        });


        if ("errors" in payment.result) {

        }

        const data = {
            receipt_number: payment.result.payment?.receiptNumber,
            url: payment.result.payment?.receiptUrl,
            total_money: payment.result.payment?.totalMoney,
            status: payment.result.payment?.status
        };

        const { json } = serialize(data);

        return res.status(200).json(json);
    } catch (error) {
        handleError(error, res);
    }
}