"use client";
import type { Card, Payments, TokenStatus } from "@square/web-payments-sdk-types";
import { createContext, useState, useReducer } from "react";
import useSWR, { type SWRResponse } from "swr";
import type { Order } from "square";
import Script from "next/script";

import type { CartItem } from "@/components/providers/ShoppingCartProvider";
import useThrottle from "@/hooks/useThrottle";
import useCart from "@/hooks/shop/useCart";

export type Address = {
    address_line?: string;
    address_line2?: string;
    city: string;
    country: string;
    familyName: string;
    givenName: string;
    phone: string;
    postalCode: string;
    state: string;
    comments?: string;
}

type PaymentResult = {
    receiptNumber: string;
    receiptUrl: string;
    totalMoney: { amount: string; currency: string };
    status: string;
}

type Discount = { name: string; id: string; scope: "ORDER" };

export type Actions = { payload: boolean, event: "SHIPPING_DONE" } |
{
    event: "FINISH_ACCOUNT_TAB_AS_GUEST"
    payload: {
        email: string;
    };
} |
{
    event: "FINISH_ACCOUNT_TAB_AS_USER",
    payload: {
        email: string;
        shipping: Partial<Address> | null;
        accountId: string;
    }
} |
{ payload: Address, event: "FINSIH_SHIPPING" } |
{ payload: { billing: Address | undefined, billingAsShipping: boolean }; event: "FINISH_BILLING" } |
{ payload: Discount; event: "ADD_DISCOUNT" } |
{ payload: string; event: "REMOVE_DISCOUNT" } |
{ payload: "account" | "shipping" | "billing", event: "SET_TAB" }

export type CheckoutState = {
    tab: "account" | "shipping" | "billing";
    email?: string;
    userType: "guest" | "account";
    accountId?: string;
    currencyCode: string;
    discounts: Discount[];
    billingAsShipping: boolean,
    billing?: Address | undefined
    shipping?: Address
    done: {
        shipping: boolean;
        account: boolean;
    }
}

export type CheckoutCtx = {
    paymentApi: Payments | undefined;
    state: CheckoutState,
    dispatch: React.Dispatch<Actions>,
    order: SWRResponse<Order | undefined, Response, unknown>
    cart: ReturnType<typeof useCart>
    setCard: (card: Card) => void,
    makePayment: () => Promise<PaymentResult>,
}

const CART_LOCALSTOARGE_KEY = "cart-v2";
export const checkoutContext = createContext<CheckoutCtx | null>(null);

const defaultCheckoutState: CheckoutState = {
    currencyCode: "USD",
    tab: "account",
    billingAsShipping: true,
    userType: "guest",
    discounts: [],
    done: {
        shipping: false,
        account: false
    }
}

const SquareWebPaymentScript = process.env.NEXT_PUBLIC_SQUARE_MODE === "sandbox" ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js";

const reducer = (state: CheckoutState, action: Actions) => {
    switch (action.event) {
        case "FINISH_BILLING": {
            return {
                ...state,
                billing: !action.payload.billingAsShipping ? action.payload.billing : undefined,
                billingAsShipping: action.payload.billingAsShipping
            } as CheckoutState
        };
        case "FINISH_ACCOUNT_TAB_AS_GUEST": {
            return {
                ...state,
                email: action.payload.email,
                tab: "shipping",
                userType: "guest",
                done: {
                    ...state.done,
                    account: true
                }
            } as CheckoutState
        }
        case "FINISH_ACCOUNT_TAB_AS_USER": {
            return {
                ...state,
                done: {
                    shipping: action.payload.shipping ? true : false,
                    account: true
                },
                userType: "account",
                tab: action.payload.shipping ? "billing" : "shipping",
                email: action.payload.email,
                accountId: action.payload.accountId,
                shipping: action.payload.shipping
            } as CheckoutState
        }
        case "SET_TAB":
            return {
                ...state,
                tab: action.payload
            }
        case "FINSIH_SHIPPING": {
            return {
                ...state,
                done: {
                    ...state.done,
                    shipping: true
                },
                shipping: action.payload,
                tab: "billing"
            } as CheckoutState
        }
        case "ADD_DISCOUNT": {
            return {
                ...state,
                discounts: [...state.discounts, action.payload]
            } as CheckoutState;
        }
        case "REMOVE_DISCOUNT": {
            const nextState = state.discounts;
            const idx = nextState.findIndex(value => value.id === action.payload);
            if (idx === -1) return state;
            nextState.splice(idx, 1);
            return {
                ...state,
                discounts: [...nextState]
            } as CheckoutState
        }
        default:
            return state;
    }
}

const initPaymentsApi = (setApi: (api: Payments) => void) => {
    try {
        if (!window.Square) throw new Error("Failed to init Square WebPayments");
        const web = window.Square.payments(
            process.env.NEXT_PUBLIC_SQUARE_APPID,
            process.env.NEXT_PUBLIC_SQAURE_LOCATION_ID,
        );
        setApi(web);
    } catch (error) {
        console.error(error);
        throw new Error("Failed to load WebPayments");
    }
}

const makePayment = async (amount: string | undefined | null, paymentApi: Payments | undefined, card: Card | undefined, checkoutState: CheckoutState, checkoutId?: string) => {
    if (!paymentApi) throw new Error("Square WebPayments Api is does not exist", { cause: "MISSING_CHECKOUT_DATA_1" });
    if (!card) throw new Error("Card form is not vaild", { cause: "MISSING_CHECKOUT_DATA_2" });
    if (!amount || Number.isNaN(amount)) throw new Error("Failed to get charge amount", { cause: "MISSING_CHECKOUT_DATA_3" });

    const data = checkoutState.billing ?? checkoutState.shipping;
    if (!data) throw new Error("Unable to verify buyer", { cause: "MISSING_CHECKOUT_DATA_4" });

    const orderRaw = window.localStorage.getItem(CART_LOCALSTOARGE_KEY);
    if (!orderRaw) throw new Error("There are not items in the cart", { cause: "INVAILD_ORDER_1" });
    const order = JSON.parse(orderRaw) as { id: string; variation: string; quantity: number }[];
    if (!order.length) throw new Error("Cart has less then 1 item in it.", { cause: "INVAILD_ORDER_2" });

    const result = await card.tokenize();

    if (result.status !== ("OK" as TokenStatus.OK)) {
        throw new Error("Failed to get token", { cause: "INVAILD_TOKEN_STATUS" });
    }

    const verification = await paymentApi.verifyBuyer(result.token!, {
        amount: (Number(amount) / 100).toFixed(2),
        billingContact: {
            addressLines: [data.address_line, data.address_line2].filter(Boolean),
            city: data.city,
            countryCode: data.country,
            email: checkoutState.email,
            familyName: data.familyName,
            phone: data.phone,
            postalCode: data.postalCode.toString(),
            state: data.state
        },
        currencyCode: checkoutState.currencyCode,
        intent: "CHARGE"
    });

    if (!verification?.token) throw new Error("Failed to obtain a verifcation token", { cause: "VERIFICATION_FAILED" });

    const request = await fetch("/api/shop/order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: checkoutState.email,
            source_verification: verification.token,
            location_id: process.env.NEXT_PUBLIC_SQAURE_LOCATION_ID,
            source_id: result.token,
            customer_id: checkoutState.accountId,
            checkout_id: checkoutId,
            discounts: checkoutState.discounts,
            items: order,
            shipping: checkoutState.shipping,
            billing: checkoutState.billing,
            billing_as_shipping: checkoutState.billingAsShipping
        })
    });

    const response = await request.json();

    if (!request.ok) {

        const error = (response as { details: { message: string; code: string; path: string[] }[] }).details[0];

        throw new Error(error?.message ?? "Unknown Error", { cause: error?.code !== "custom" ? error?.code : error.path[0] })
    }

    window.localStorage.removeItem(CART_LOCALSTOARGE_KEY);

    return response as PaymentResult;
}

const getCalculation = async ([url, discounts, items]: [string, Discount[], CartItem[]]) => {
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            location_id: process.env.NEXT_PUBLIC_SQAURE_LOCATION_ID,
            order: items,
            discounts
        }),
    });
    if (!response.ok) throw response;
    return response.json() as Promise<Order>;
}

const CheckoutProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, defaultCheckoutState);
    const cart = useCart();
    const [paymentApi, setPaymentApi] = useState<Payments>();

    const [card, setCard] = useState<Card>();

    const throttledCartItems = useThrottle(cart.items, 1000);

    const order = useSWR<
        Order | undefined,
        Response
    >(
        throttledCartItems.length ? ["/api/shop/order-calculate", state.discounts, throttledCartItems] : null, getCalculation, {
        revalidateOnFocus: false
    });

    return (
        <checkoutContext.Provider value={{
            dispatch,
            setCard,
            cart,
            state,
            paymentApi,
            order,
            makePayment: () => makePayment(order.data?.netAmountDueMoney?.amount as string | null | undefined, paymentApi, card, state)
        }}>
            {children}

            <Script src={SquareWebPaymentScript} onReady={() => initPaymentsApi(setPaymentApi)}></Script>
        </checkoutContext.Provider>
    );
}

export default CheckoutProvider;