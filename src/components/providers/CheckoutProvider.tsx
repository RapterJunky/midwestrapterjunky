"use client";
import type { Card, Payments, TokenStatus } from "@square/web-payments-sdk-types";
import { createContext, useState, useReducer } from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";

export type Address = {
    address_line?: string;
    addres_line2?: string;
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

export type Actions = { payload: boolean, event: "SHIPPING_DONE" } |
{ payload: boolean; event: "ACCOUNT_DONE" } |
{ payload: string; event: "SET_EMAIL" } |
{ payload: string; event: "SET_ACCOUNT_ID" } |
{ payload: string; event: "ADD_DISCOUNT" } |
{ payload: string; event: "REMOVE_DISCOUNT" } |
{ payload: Address; event: "SET_BILLING" } |
{ payload: Address; event: "SET_SHIPPING" } |
{ payload: boolean, event: "SET_SHIPPING_AS_BILLING" }

export type CheckoutState = {
    email?: string;
    accountId?: string;
    currencyCode: string;
    discounts: { name: string; id: string; scope: "ORDER" }[];
    billingAsShipping: boolean,
    billing: Address | null
    shipping: Address
    done: {
        shipping: boolean;
        account: boolean;
    }
}

export type CheckoutCtx = {
    paymentApi: Payments | undefined;
    state: CheckoutState,
    dispatch: React.Dispatch<Actions>,
    setCard: (card: Card) => void,
    makePayment: (amount: number, card: Card) => Promise<PaymentResult>
}

const CART_LOCALSTOARGE_KEY = "cart-v2";
export const checkoutContext = createContext<CheckoutCtx | null>(null);

const defaultCheckoutState: CheckoutState = {
    currencyCode: "USD",
    billingAsShipping: true,
    discounts: [],
    billing: null,
    shipping: {
        city: "",
        country: "",
        familyName: "",
        givenName: "",
        phone: "",
        postalCode: "",
        state: ""
    },
    done: {
        shipping: false,
        account: false
    }
}

const SquareWebPaymentScript = process.env.NEXT_PUBLIC_SQUARE_MODE === "sandbox" ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js";

const reducer = (state: CheckoutState, action: Actions) => {
    switch (action.event) {
        case "SHIPPING_DONE":
        case "ACCOUNT_DONE":
        case "SET_EMAIL":
        case "SET_ACCOUNT_ID":
        case "ADD_DISCOUNT":
        case "REMOVE_DISCOUNT":
        case "SET_BILLING":
        case "SET_SHIPPING":
        case "SET_SHIPPING_AS_BILLING":
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

const makePayment = async (amount: number, paymentApi: Payments | undefined, card: Card | undefined, checkoutState: CheckoutState, checkoutId?: string) => {
    if (!paymentApi) throw new Error("Square WebPayments Api is does not exist", { cause: "MISSING_PAYMENT_API" });
    if (!card) throw new Error("Card form is not vaild", { cause: "MISSING_CARD_HANDLER" });
    if (!checkoutId) throw new Error("CheckoutId is missing.", { cause: "MISSING_CHECKOUT_ID" });

    const orderRaw = window.localStorage.getItem(CART_LOCALSTOARGE_KEY);
    if (!orderRaw) throw new Error("There are not items in the cart");
    const order = JSON.parse(orderRaw) as { id: string; variation: string; quantity: number }[];
    if (!order.length) throw new Error("Cart has less then 1 item in it.");

    const result = await card.tokenize();

    if (result.status !== ("OK" as TokenStatus.OK)) {
        throw new Error();
    }

    const data = checkoutState.billing ?? checkoutState.shipping;

    const verification = await paymentApi.verifyBuyer(result.token!, {
        amount: (amount / 100).toFixed(2),
        billingContact: {
            addressLines: [data.address_line, data.addres_line2].filter(Boolean),
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
            address: {
                shipping: checkoutState.shipping,
                billing: checkoutState.billing,
                billing_as_shipping: checkoutState.billingAsShipping
            }
        })
    });

    if (!request.ok) throw request;

    window.localStorage.removeItem(CART_LOCALSTOARGE_KEY);

    return request.json() as Promise<PaymentResult>;
}

const CheckoutProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [checkoutState, dispatch] = useReducer(reducer, defaultCheckoutState);
    const [paymentApi, setPaymentApi] = useState<Payments>();
    const searchParams = useSearchParams();

    const [card, setCard] = useState<Card>();

    return (
        <checkoutContext.Provider value={{
            dispatch,
            setCard,
            state: checkoutState,
            paymentApi,
            makePayment: (amount: number) => makePayment(amount, paymentApi, card, checkoutState, searchParams?.get("checkoutId")?.toString())
        }}>
            {children}

            <Script src={SquareWebPaymentScript} onReady={() => initPaymentsApi(setPaymentApi)}></Script>
        </checkoutContext.Provider>
    );
}

export default CheckoutProvider;