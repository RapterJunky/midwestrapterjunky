import createHttpError from "http-errors";
import { Client, Environment } from "square";
import { serialize } from "superjson";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from 'zod';
import { handleError } from "@/lib/api/errorHandler";
import { applyRateLimit } from "@/lib/api/rateLimiter";
import getPricingForVarable from "@/lib/shop/getPricingForVarable";

const schema = z.object({
    location_id: z.string().nonempty(),
    customer_id: z.string().optional(),
    source_id: z.string().min(1).nonempty(),
    source_verification: z.string().min(1).nonempty(),
    checkout_id: z.string().uuid().min(1).max(45).nonempty(),
    items: z.array(z.object({
        pricingType: z.string(),
        catalogObjectId: z.string().max(192),
        quantity: z.coerce.string().max(12).min(1).refine((arg) => arg !== "0", { message: "Quantity should not be 0" }),
    })).nonempty(),
    discounts: z.array(z.object({
        catalogObjectId: z.string(),
        scope: z.literal("ORDER")
    })),
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
            phone: z.string().max(30).regex(/[\d \-\+]+/),
            city: z.string(),
            state: z.string(),
            comments: z.string().optional()
        }),
        billing: z.object({
            firstname: z.string().max(100),
            lastname: z.string().max(100),
            address_line1: z.string(),
            address_line2: z.string().optional(),
            country: z.string(),
            postal: z.string().max(20),
            phone: z.string().max(30).regex(/[\d \-\+]+/),
            city: z.string(),
            state: z.string(),
        }).optional()
    }),
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
        await applyRateLimit(req, res);

        const { email, items, checkout_id, location_id, source_id, source_verification, customer_id, discounts, address } = schema.parse(req.body);

        const client = new Client({
            accessToken: process.env.SQAURE_ACCESS_TOKEN,
            environment: process.env.SQUARE_MODE as Environment
        });

        const lineItems = await getPricingForVarable(client, items);

        const clientOrder = await client.ordersApi.createOrder({
            idempotencyKey: checkout_id,
            order: {
                source: {
                    name: "Website"
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
                                    administrativeDistrictLevel1: address.shipping.state
                                }
                            }
                        }
                    }
                ],
                customerId: customer_id,
                locationId: location_id,
                lineItems,
                discounts: discounts,
                serviceCharges: [
                    {
                        name: "Provider Charge Persent",
                        percentage: "2.9",
                        calculationPhase: "TOTAL_PHASE"
                    },
                    {
                        name: "Shipping",
                        amountMoney: {
                            amount: BigInt(500),
                            currency: "USD"
                        },
                        calculationPhase: "TOTAL_PHASE"
                    },
                    {
                        name: "Provider Charge Flat",
                        amountMoney: {
                            amount: BigInt(30),
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

        if (!clientOrder.result.order) throw createHttpError.InternalServerError("Failed to get order: 1");
        const { netAmountDueMoney, id: orderId } = clientOrder.result.order;
        if (!orderId || !netAmountDueMoney) throw createHttpError.InternalServerError("Failed to get order: 2");

        const payment = await client.paymentsApi.createPayment({
            idempotencyKey: checkout_id,
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
                administrativeDistrictLevel1: address.shipping.state
            },
            billingAddress: {
                addressLine1: address.billing_as_shipping ? address.shipping.address_line1 : address.billing?.address_line1!,
                addressLine2: address.billing_as_shipping ? address.shipping.address_line2 : address.billing?.address_line2,
                country: address.billing_as_shipping ? address.shipping.country : address.billing?.country,
                postalCode: address.billing_as_shipping ? address.shipping.postal : address.billing?.postal,
                firstName: address.billing_as_shipping ? address.shipping.firstname : address.billing?.firstname,
                lastName: address.billing_as_shipping ? address.shipping.lastname : address.billing?.lastname,
                locality: address.billing_as_shipping ? address.shipping.city : address.billing?.city,
                administrativeDistrictLevel1: address.billing_as_shipping ? address.shipping.state : address.billing?.state
            }
        });

        if (!payment.result.payment) throw createHttpError.InternalServerError("Failed to get payment data: 1");
        const { receiptNumber, receiptUrl, totalMoney, status } = payment.result.payment;

        const data = {
            receiptNumber,
            receiptUrl,
            totalMoney,
            status
        };

        const { json } = serialize(data);

        return res.status(200).json(json);
    } catch (error) {
        handleError(error, res);
    }
}