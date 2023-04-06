import type { TokenDetails } from "@square/web-payments-sdk-types";
import type { Order } from "square";
import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import Script from 'next/script';
import useSWR from 'swr';

import useCart, { CartProvider } from "@/hooks/useCart";
import { NextPageWithProvider } from "@/types/page";
import Footer from '@/components/layout/Footer';
import CustomerInfo from '@/components/shop/checkout/CustomerInfo';
import ShippingPanel from '@/components/shop/checkout/ShippingPanel';
import BillingPanel from '@/components/shop/checkout/BillingPanel';
import ShoppingCartItem from "@/components/shop/ShoppingCartItem";
import useFormatPrice from "@/hooks/useFormatPrice";
import { useRouter } from "next/router";

export type CheckoutFormState = {
    ready: {
        shipping: boolean;
        user: boolean;
    };
    user: "account" | "guest",
    email: string;
    shipping_details: {
        name: string;
        address_line1: string;
        address_line2: string;
        country: string;
        postal: number;
        phone: string;
        city: string;
        state: string;
        comments?: string
    },
    billing: {
        name: string;
        token: string;
        billing_as_shipping: boolean;
        details: TokenDetails | undefined;
        address: {
            name: string;
            address_line1: string;
            address_line2: string;
            country: string;
            postal: number;
            phone: string;
            city: string;
            state: string;
        } | undefined;
    }
};

//https://bootsnipp.com/snippets/ypqoW
//https://react-square-payments.weareseeed.com/docs/props#optional-props
const Checkout: NextPageWithProvider = () => {
    const router = useRouter();
    const { data, subtotal, isEmpty, loading } = useCart();
    const formatPrice = useFormatPrice("USD");
    const [discount, setDiscount] = useState<Array<{ name: string; catalogObjectId: string; scope: "ORDER" }>>([]);
    const { data: order, isLoading, error } = useSWR(router.query.checkoutId || !loading ? [discount, data] : null, async ([code, items]) => {
        const response = await fetch("/api/shop/order-calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                checkout_id: router.query.checkoutId,
                location_id: "L730KS46N8B3Y",
                order: items.map(value => ({
                    name: value.name,
                    catalogObjectId: value.option.id,
                    quantity: value.quantity,
                    basePriceMoney: {
                        amount: value.price,
                        currency: "USD"
                    }
                })),
                discounts: code
            })
        });
        if (!response.ok) throw response;
        return response.json() as Promise<Order>;
    });
    const [final, setFinal] = useState<Partial<CheckoutFormState>>({
        ready: {
            shipping: false,
            user: false
        }
    });
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        if (!loading && (!router.query.checkoutId || isEmpty)) {
            router.replace("/shop/search");
        }
    }, [loading]);

    return (
        <div className='flex flex-col h-full'>
            <div className="flex justify-center flex-1">
                <div className="container max-w-6xl h-full">
                    <main className="grid grid-cols-1 lg:grid-cols-3 flex-1">
                        <div className="col-span-2 p-6 order-2 lg:order-none flex flex-col">
                            <Tab.Group manual={false} selectedIndex={selectedIndex} onChange={setSelectedIndex}>
                                <div className="flex justify-center mt-4">
                                    <Tab.List>
                                        <Tab className="ui-selected:text-primary ui-selected:underline text-neutral-500 transition duration-150 ease-in-out hover:text-neutral-600 focus:text-neutral-600 active:text-primary-700">Customer Information</Tab>
                                        <span className="mx-2 text-neutral-500 dark:text-neutral-400">&gt;</span>
                                        <Tab className="ui-selected:text-primary ui-selected:underline text-neutral-500 transition duration-150 ease-in-out hover:text-neutral-600 focus:text-neutral-600 active:text-primary-700">Delivery</Tab>
                                        <span className="mx-2 text-neutral-500 dark:text-neutral-400">&gt;</span>
                                        <Tab className="ui-selected:text-primary ui-selected:underline text-neutral-500 transition duration-150 ease-in-out hover:text-neutral-600 focus:text-neutral-600 active:text-primary-700">Billing</Tab>
                                    </Tab.List>
                                </div>
                                <div className="mt-4 flex justify-center h-full">
                                    <Tab.Panels className="container max-w-5xl h-full">
                                        <CustomerInfo next={() => setSelectedIndex(1)} setGlobalState={setFinal} state={final} />
                                        <ShippingPanel next={setSelectedIndex} state={final} setGlobalState={setFinal} selected={selectedIndex} />
                                        <BillingPanel netTotal={Number(order?.netAmountDueMoney?.amount)} discount={[discount, setDiscount]} next={setSelectedIndex} state={final} selected={selectedIndex} />
                                    </Tab.Panels>
                                </div>
                            </Tab.Group>
                        </div>
                        <div className="col-span-1 flex justify-start order-1 lg:order-none p-6 w-full">
                            <div className="w-full">
                                <h1 className="text-4xl font-bold">Cart</h1>
                                <hr />
                                {data.map((item, i) => (
                                    <ShoppingCartItem key={i} data={item} />
                                ))}
                                <hr />
                                <ul className="pb-2">
                                    <li className="flex justify-between py-1">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(subtotal)}</span>
                                    </li>
                                    {!!discount.length ? (
                                        <li className="flex justify-between py-1">
                                            <span>Discount</span>
                                            <span>-{isLoading ? "Calculating..." : formatPrice(Number(order?.totalDiscountMoney?.amount))}</span>
                                        </li>
                                    ) : null}
                                    <li className="flex justify-between py-1">
                                        <span>Taxes</span>
                                        <span>{isLoading ? "Calculating..." : formatPrice(Number(order?.totalTaxMoney?.amount))}</span>
                                    </li>
                                    <li className="flex justify-between py-1">
                                        <span>Shipping</span>
                                        <span>{isLoading ? "Calculating..." : formatPrice(Number(order?.totalServiceChargeMoney?.amount))}</span>
                                    </li>
                                </ul>
                                <div className="flex justify-between border-t border-accent-2 py-3 mb-2">
                                    <span>Total</span>
                                    <span>USD <span className="font-bold tracking-wide">{isLoading ? "Calculating..." : formatPrice(Number(order?.netAmountDueMoney?.amount))}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
            <Script src="https://sandbox.web.squarecdn.com/v1/square.js" />
        </div>
    );
}

Checkout.provider = CartProvider;

export default Checkout;