import { type ApiResponse, Client, type CreateOrderResponse, type CreatePaymentResponse, type OrderLineItem, type OrderLineItemDiscount } from "square";
import { NextResponse, type NextRequest } from 'next/server';
import { z, ZodError } from "zod";
import createHttpError from 'http-errors';
import { randomUUID } from "node:crypto";
import { serialize } from 'superjson';
import onError from '@/lib/api/handleError';
import ratelimit from '@/lib/api/rateLimit';
import { logger } from "@/lib/logger";

const schema = z.object({
    location_id: z.string().nonempty(),
    customer_id: z.string().optional(),
    source_id: z.string().min(1).nonempty(),
    source_verification: z.string().min(1).nonempty(),
    items: z
        .array(
            z.object({
                id: z.string().max(192),
                quantity: z.coerce
                    .string()
                    .min(1)
                    .refine((arg) => arg !== "0", {
                        message: "Quantity should not be 0",
                    }),
            }),
        )
        .nonempty(),
    discounts: z.array(
        z.object({
            id: z.string(),
            scope: z.literal("ORDER"),
        }),
    ),
    email: z.string().email().max(255).nonempty(),
    billing_as_shipping: z.boolean(),
    shipping: z.object({
        givenName: z.string().max(100),
        familyName: z.string().max(100),
        address_line: z.string(),
        address_line2: z.string().optional(),
        country: z.string(),
        postalCode: z.string().max(20),
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
            givenName: z.string().max(100),
            familyName: z.string().max(100),
            address_line: z.string(),
            address_line2: z.string().optional(),
            country: z.string(),
            postalCode: z.string().max(20),
            phone: z
                .string()
                .max(30)
                .regex(/[\d \-\+]+/),
            city: z.string(),
            state: z.string(),
        })
        .optional()
});

const errorResponses = {
    ADDRESS_VERIFICATION_FAILURE: {
        message:
            "The card issuer declined the request because the postal code is invaild.",
        type: "user",
    },
    CARDHOLDER_INSUFFICIENT_PERMISSIONS: {
        message:
            "The card issuer has declined the transaction due to restrictions on where the card can be used.",
        type: "user",
    },
    CARD_EXPIRED: {
        message: "The card issuer declned the request because the card is expired.",
        type: "user",
    },
    CARD_NOT_SUPPORTED: {
        message:
            "The card is not supported either in the geographic region or by the MCC.",
        type: "user",
    },
    CVV_FAILURE: {
        message:
            "The card issuer declined the request because the CVV value is invaild.",
        type: "user",
    },
    EXPIRATION_FAILURE: {
        message:
            "The card issuer declined the request because the CVV value is invaild.",
        type: "user",
    },
    GENERIC_DECLINE: {
        message: "The card was declined.",
        type: "user",
    },
    INSUFFICIENT_FUNDS: {
        message: "Insufficient Funds",
        type: "user",
    },
    INVALID_ACCOUNT: {
        message: "The issuer was not able to locate the account on record",
        type: "user",
    },
    INVALID_CARD: {
        message:
            "The credit card cannot be validated based on the provided details.",
        type: "user",
    },
    INVALID_CARD_DATA: {
        message: "The provided card data is invaild.",
        type: "user",
    },
    INVALID_EXPIRATION: {
        message: "The expiration date for the payment card is invaild.",
        type: "user",
    },
    INVALID_PIN: {
        message: "The card issuer declined the request because the PIN is invaild.",
        type: "user",
    },
    INVALID_POSTAL_CODE: {
        message: "The postal code is incorrectyl formatted.",
        type: "user",
    },
    PAN_FAILURE: {
        message: "The specified card number is invaild.",
        type: "user",
    },
    TRANSACTION_LIMIT: {
        message:
            "The card issuer has determined the payment amount is either too hight or too low.",
        type: "user",
    },
    VOICE_FAILURE: {
        message:
            "The card issuer declined the request because the issuer requires voice authorization from cardholder.",
        type: "user",
    },
    ALLOWABLE_PIN_TRIES_EXCEEDED: {
        message:
            "The card has exhausted its available pin entry retries set by the card issuer.",
        type: "user",
    },
    BAD_EXPIRATION: {
        message:
            "The card expiration date is either missing or incorrectyl formatted.",
        type: "user",
    },
    CARD_DECLINED_VERIFICATION_REQUIRED: {
        message:
            "The payment card was declined with a request for additional verification.",
        type: "user",
    },
    INVALID_EMAIL_ADDRESS: {
        message: "The provider email address is invaild",
        type: "user-other",
    },
    PAYMENT_LIMIT_EXCEEDED: {
        message:
            "The payment was declined because the payment amount execeeded the processing limit for this merchant.",
        type: "service",
    },
    MANUALLY_ENTERED_PAYMENT_NOT_SUPPORTED: {
        message: "The card must be swiped, tapped or dipped.",
        type: "retry",
    },
    IDEMPOTENCY_KEY_REUSED: {
        message: "There was an temporary internal error. Please try again.",
        type: "retry",
    },
    TEMPORARY_ERROR: {
        message: "There was an temporary internal error. Please try again.",
        type: "retry",
    },
    CARD_TOKEN_EXPIRED: {
        message: "Please try again. Checkout was expired.",
        type: "retry",
    },
    CHIP_INSERTION_REQUIRED: {
        message:
            "The card issuer requires that the card be read using a chip reader.",
        type: "retry",
    },
    GIFT_CARD_AVAILABLE_AMOUNT: {
        message: "Cannot take partial payment with a tip with a gift card.",
        type: "retry",
    },
    CARD_TOKEN_USED: {
        message: "The payment was already processed.",
        type: "exit",
    },
    INSUFFICIENT_PERMISSIONS: {
        message:
            "The payment processer does not have permissions to accept this payment.",
        type: "exit",
    },
    INVALID_FEES: {
        message: "Unable to process payment.",
        type: "exit",
    },
    INVALID_LOCATION: {
        message: "Can not take payments from the specified region.",
        type: "exit",
    },
    PAYMENT_AMOUNT_MISMATCH: {
        message:
            "The payment was declined because there was a payment amount mismatch.",
        type: "exit",
    },
    CARD_PROCESSING_NOT_ENABLED: {
        message: "Unable to be processed due to card processing not being enabled.",
        type: "exit",
    },
    UNKNOWN_ERROR: {
        message: "A Unknown error has happend."
    }
};

export async function POST(request: NextRequest) {
    try {
        await ratelimit(request.ip);

        const idempotencyKey = randomUUID();

        const body = await request.json();

        const {
            email,
            items,
            location_id,
            source_id,
            source_verification,
            customer_id,
            discounts,
            shipping,
            billing_as_shipping,
            billing
        } = schema.parse(body);

        const client = new Client({
            accessToken: process.env.SQAURE_ACCESS_TOKEN,
            environment: process.env.SQUARE_MODE,
        });

        const lineItems: OrderLineItem[] = items.map(value => ({
            catalogObjectId: value.id,
            quantity: value.quantity,
        }));

        const tdiscounts: OrderLineItemDiscount[] = discounts.map(value => ({
            catalogObjectId: value.id,
            scope: value.scope
        }));

        const { result: orderResult } = await client.ordersApi
            .createOrder({
                idempotencyKey,
                order: {
                    source: {
                        name: "Website",
                    },
                    fulfillments: [
                        {
                            type: "SHIPMENT",
                            shipmentDetails: {
                                shippingNote: shipping?.comments,
                                recipient: {
                                    displayName: `${shipping.givenName} ${shipping.familyName}`,
                                    emailAddress: email,
                                    phoneNumber: shipping.phone,
                                    address: {
                                        addressLine1: shipping.address_line,
                                        addressLine2: shipping.address_line2,
                                        country: shipping.country,
                                        postalCode: shipping.postalCode,
                                        firstName: shipping.givenName,
                                        lastName: shipping.familyName,
                                        locality: shipping.city,
                                        administrativeDistrictLevel1: shipping.state,
                                    },
                                },
                            },
                        },
                    ],
                    customerId: customer_id,
                    locationId: location_id,
                    lineItems,
                    discounts: tdiscounts,
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
            }).catch(error => {
                return error as ApiResponse<CreateOrderResponse>;
            });

        if (orderResult.errors) {
            logger.error(orderResult.errors);
            const error = orderResult.errors ? orderResult.errors[0] ?? { code: "UNKNOWN_ERROR" } : { code: "UNKNOWN_ERROR" };

            throw new ZodError([
                {
                    message: errorResponses[error.code as keyof typeof errorResponses].message,
                    code: "custom",
                    fatal: true,
                    path: [
                        error.code
                    ]
                }
            ]);
        }

        if (!orderResult.order)
            throw createHttpError.InternalServerError("Failed to create order");

        const { netAmountDueMoney, id: orderId } = orderResult.order;

        if (!orderId || !netAmountDueMoney) throw createHttpError.InternalServerError("Failed to get order info");

        const billingInfo = billing_as_shipping ? shipping : billing ?? shipping;

        const { result } = await client.paymentsApi
            .createPayment({
                // a new payment idemptencyKey should be created every time,
                // while order may stay the same since the order shount change by this time.
                idempotencyKey,
                locationId: location_id,
                customerId: customer_id,
                sourceId: source_id,
                verificationToken: source_verification,
                orderId,
                autocomplete: true,
                amountMoney: netAmountDueMoney,
                buyerEmailAddress: email,
                shippingAddress: {
                    addressLine1: shipping.address_line,
                    addressLine2: shipping.address_line2,
                    country: shipping.country,
                    postalCode: shipping.postalCode,
                    firstName: shipping.givenName,
                    lastName: shipping.familyName,
                    locality: shipping.city,
                    administrativeDistrictLevel1: shipping.state,
                },
                billingAddress: {
                    addressLine1: billingInfo.address_line,
                    addressLine2: billingInfo?.address_line2,
                    country: billingInfo.country,
                    postalCode: billingInfo.postalCode,
                    firstName: billingInfo.givenName,
                    lastName: billingInfo.familyName,
                    locality: billingInfo.city,
                    administrativeDistrictLevel1: billingInfo.state,
                },
            }).catch(error => {
                return error as ApiResponse<CreatePaymentResponse>;
            });

        if (result?.errors || !result.payment) {
            logger.error(result.errors);
            const error = result.errors ? result.errors[0] ?? { code: "UNKNOWN_ERROR" } : { code: "UNKNOWN_ERROR" };

            throw new ZodError([
                {
                    message: errorResponses[error.code as keyof typeof errorResponses].message,
                    code: "custom",
                    fatal: true,
                    path: [
                        error.code
                    ]
                }
            ]);
        }

        const { receiptNumber, receiptUrl, totalMoney, status } = result.payment;

        const { json } = serialize({
            receiptNumber,
            receiptUrl,
            totalMoney,
            status,
        });

        return NextResponse.json(json);

    } catch (error) {
        return onError(error);
    }
}