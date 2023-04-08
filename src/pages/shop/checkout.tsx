import { useState, useEffect, useReducer } from 'react';
import { useRouter } from "next/router";
import type { Order } from "square";
import useSWR from 'swr';

import ShippingPanel from '@/components/shop/checkout/ShippingPanel';
import CustomerInfo from '@/components/shop/checkout/CustomerInfo';
import BillingPanel from '@/components/shop/checkout/BillingPanel';
import ShoppingCartItem from "@/components/shop/ShoppingCartItem";
import Footer from '@/components/layout/Footer';
import SiteTags from '@components/SiteTags'

import type { FullPageProps, NextPageWithProvider } from "@type/page";
import { SquareSDKProvider } from "@hook/useSquareSDK";
import useCart, { CartProvider } from "@hook/useCart";
import GenericPageQuery from '@/gql/queries/generic';
import useFormatPrice from "@hook/useFormatPrice";
import { fetchCachedQuery } from '@lib/cache';

export type Address = {
    firstname: string;
    lastname: string;
    address_line1: string;
    address_line2: string;
    country: string;
    postal: string;
    phone: string;
    city: string;
    state: string;
    comments?: string;
};

export type CheckoutAction = "removeDiscount" | "addDiscount" | "setUserEmail" | "setAddressShipping" | "setUserType" | "setCompleted";
export type CheckoutState = {
    completed: {
        shipping: boolean;
        user: boolean;
    };
    user: "account" | "guest",
    email?: string;
    discounts: Array<{ name: string; catalogObjectId: string; scope: "ORDER" }>,
    address: {
        billing_as_shipping: boolean;
        shipping?: Address;
        billing?: Address;
    }
};

export async function getStaticProps() {
    const data = await fetchCachedQuery<Omit<FullPageProps, "preview">>("GenericPage", GenericPageQuery);
    return {
        props: {
            _site: data._site,
            preview: false,
        },
    };
}

const checkoutReducer = (state: CheckoutState, action: { type: CheckoutAction, payload: any }): CheckoutState => {
    switch (action.type) {
        case "addDiscount":
            return {
                ...state,
                discounts: [action.payload, ...state.discounts]
            }
        case "removeDiscount": {
            return {
                ...state,
                discounts: state.discounts.filter(value => value.catalogObjectId !== action.payload)
            }
        }
        case "setAddressShipping":
            return {
                ...state,
                address: {
                    ...state.address,
                    shipping: action.payload
                }
            }
        case "setCompleted":
            const completed = {
                ...state.completed
            }
            completed[action.payload.type as keyof CheckoutState["completed"]] = action.payload.value;
            return {
                ...state,
                completed,
            }
        case "setUserEmail":
            return {
                email: action.payload,
                ...state
            }
        case "setUserType":
            return {
                ...state,
                user: action.payload
            }
        default:
            return state;
    }
}

//https://bootsnipp.com/snippets/ypqoW
//https://react-square-payments.weareseeed.com/docs/props#optional-props
const Checkout: NextPageWithProvider<Omit<FullPageProps, "navbar">> = ({ _site }) => {
    const [checkoutState, dispatch] = useReducer(checkoutReducer, {
        completed: {
            shipping: false,
            user: false
        },
        user: "guest",
        address: {
            billing_as_shipping: true
        },
        discounts: []
    });
    const { data, subtotal, isEmpty, loading } = useCart();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const formatPrice = useFormatPrice("USD");
    const router = useRouter();
    const { data: order, isLoading, error } = useSWR(router.query.checkoutId && !loading ? [checkoutState.discounts, data] : null, async ([code, items]) => {
        const response = await fetch("/api/shop/order-calculate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                checkout_id: router.query.checkoutId,
                location_id: process.env.NEXT_PUBLIC_SQAURE_LOCATION_ID,
                order: items.map(value => ({
                    catalogObjectId: value.option.id,
                    quantity: value.quantity,
                    pricingType: value.option.pricingType,
                })),
                discounts: code
            })
        });
        if (!response.ok) throw response;
        return response.json() as Promise<Order>;
    });

    useEffect(() => {
        // on page reload `query.checkoutId` this maybe a bug but it does force
        // client to restart checkout.
        if (!loading && isEmpty) router.replace("/shop");
    }, [loading]);

    return (
        <div className='flex flex-col h-full'>
            <SiteTags tags={[
                _site.faviconMetaTags,
                [
                    { tag: "title", content: "Checkout - Midwest Raptor Junkies" },
                    {
                        tag: "meta",
                        attributes: { name: "robots", content: "noindex,nofollow" },
                    }
                ]
            ]} />
            <div className="flex justify-center flex-1">
                <div className="container max-w-6xl h-full">
                    <main className="grid grid-cols-1 lg:grid-cols-3 flex-1">
                        <div className="col-span-2 p-6 order-2 lg:order-none flex flex-col">

                            <div className="flex justify-center mt-4">
                                <div role="tablist" aria-orientation="horizontal">
                                    <button onClick={() => setSelectedIndex(0)} id="tab-btn-1" tabIndex={0} aria-controls='tab-1' aria-selected={selectedIndex === 0 ? "true" : "false"} data-headlessui-state={selectedIndex === 0 ? "selected" : ""} role='tab' type="button" className="ui-selected:text-primary ui-selected:underline text-neutral-500 transition duration-150 ease-in-out hover:text-neutral-600 focus:text-neutral-600 active:text-primary-700">
                                        Customer Information
                                    </button>
                                    <span className="mx-2 text-neutral-500">&gt;</span>
                                    <button onClick={() => setSelectedIndex(1)} id="tab-btn-2" tabIndex={1} aria-controls='tab-2' aria-selected={selectedIndex === 1 ? "true" : "false"} data-headlessui-state={selectedIndex === 1 ? "selected" : ""} role='tab' type="button" className="ui-selected:text-primary ui-selected:underline text-neutral-500 transition duration-150 ease-in-out hover:text-neutral-600 focus:text-neutral-600 active:text-primary-700">Delivery</button>
                                    <span className="mx-2 text-neutral-500">&gt;</span>
                                    <button onClick={() => setSelectedIndex(2)} id="tab-btn-3" tabIndex={2} aria-controls='tab-3' aria-selected={selectedIndex === 2 ? "true" : "false"} data-headlessui-state={selectedIndex === 2 ? "selected" : ""} role='tab' type="button" className="ui-selected:text-primary ui-selected:underline text-neutral-500 transition duration-150 ease-in-out hover:text-neutral-600 focus:text-neutral-600 active:text-primary-700">Billing</button>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-center h-full">
                                <div className="container max-w-5xl h-full">
                                    <CustomerInfo active={selectedIndex === 0} next={() => setSelectedIndex(1)} checkout={[checkoutState, dispatch]} />
                                    <ShippingPanel active={selectedIndex === 1} next={setSelectedIndex} checkout={[checkoutState, dispatch]} />
                                    <SquareSDKProvider>
                                        <BillingPanel active={selectedIndex === 2} netTotal={Number(order?.netAmountDueMoney?.amount)} checkout={[checkoutState, dispatch]} next={setSelectedIndex} selected={selectedIndex} />
                                    </SquareSDKProvider>
                                </div>
                            </div>
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
                                    {!!checkoutState.discounts.length ? (
                                        <li className="flex justify-between py-1">
                                            <span>Discount</span>
                                            <span>-{isLoading ? "Calculating..." : error ? "Failed to calculate." : formatPrice(Number(order?.totalDiscountMoney?.amount))}</span>
                                        </li>
                                    ) : null}
                                    <li className="flex justify-between py-1">
                                        <span>Taxes</span>
                                        <span>{isLoading ? "Calculating..." : error ? "Failed to calculate." : formatPrice(Number(order?.totalTaxMoney?.amount))}</span>
                                    </li>
                                    <li className="flex justify-between py-1">
                                        <span>Service Charges</span>
                                        <span>{isLoading ? "Calculating..." : error ? "Failed to calculate." : formatPrice(Number(order?.totalServiceChargeMoney?.amount))}</span>
                                    </li>
                                </ul>
                                <div className="flex justify-between border-t border-accent-2 py-3 mb-2">
                                    <span>Total</span>
                                    <span>USD <span className="font-bold tracking-wide">{isLoading ? "Calculating..." : error ? "Failed to calculate." : formatPrice(Number(order?.netAmountDueMoney?.amount))}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
}

Checkout.provider = CartProvider;

export default Checkout;