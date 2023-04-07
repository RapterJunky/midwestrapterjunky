import { useForm } from "react-hook-form";
import { Tab } from "@headlessui/react";
import { useRef, useState } from 'react';

import type { CheckoutState, CheckoutAction, Address } from "@/pages/shop/checkout";
import AddressForm from "./AddressForm";
import { HiChevronLeft, HiX } from "react-icons/hi";
import useFormatPrice from "@/hooks/useFormatPrice";
import useCart from "@/hooks/useCart";
import { useRouter } from "next/router";
import SquareCardForm from "./SquareCardForm";
import DiscountForm from "./DiscountForm";

type Props = {
    next: React.Dispatch<React.SetStateAction<number>>,
    selected: number;
    netTotal: number,
    checkout: [CheckoutState, React.Dispatch<{ type: CheckoutAction, payload: any }>]
}

//https://react-square-payments.weareseeed.com/docs/props#optional-props
//https://web.dev/payment-and-address-form-best-practices/#html-elements
//https://developer.squareup.com/docs/devtools/sandbox/payments
const BillingPanel: React.FC<Props> = ({ next, checkout: [checkoutState, dispatch], netTotal }) => {
    const paymentHandle = useRef<{ loading: () => boolean, tokenize: (email: string, billing: Address, amount: number, currencyCode: string) => Promise<{ token: string; verificationToken: string; }>; }>();
    const { handleSubmit, register, watch, formState: { errors, isSubmitting, isValidating } } = useForm<CheckoutState>({
        defaultValues: checkoutState
    });
    const sameShpppingAddress = watch("address.billing_as_shipping");
    const formatPrice = useFormatPrice("USD");
    const router = useRouter();
    const { data } = useCart();

    const handleBilling = async (formState: CheckoutState) => {
        try {
            if (!paymentHandle.current) throw new Error("Payment service is not set!");
            if (!checkoutState.email || !checkoutState.completed.shipping || !router.query.checkoutId) throw new Error("Misssing form values");

            const { verificationToken, token } = await paymentHandle.current.tokenize(
                checkoutState.email,
                formState.address.billing_as_shipping ? checkoutState.address.shipping! : formState.address.billing!,
                netTotal,
                "USD"
            );

            const response = await fetch("/api/shop/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    source_verification: verificationToken,
                    location_id: "L730KS46N8B3Y",
                    source_id: token,
                    checkout_id: router.query.checkoutId,
                    items: data.map((item => ({
                        pricingType: item.option.pricingType,
                        catalogObjectId: item.option.id,
                        quantity: item.quantity
                    }))),
                    discounts: checkoutState.discounts,
                    address: {
                        shipping: checkoutState.address.shipping,
                        billing_as_shipping: formState.address.billing_as_shipping,
                        billing: formState.address?.billing
                    },
                    email: checkoutState.email,
                })
            });

            if (!response.ok) {
                throw response;
            }

            const result = await response.json() as { receiptNumber: string; receiptUrl: string; totalMoney: { amount: string; currency: string; }, status: string; };
            window.localStorage.removeItem("cart");
            router.replace(`/shop/search?receiptNumber=${result.receiptNumber}`);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Tab.Panel className="flex flex-col justify-center items-center">
            <form className='w-full' onSubmit={handleSubmit(handleBilling)}>
                <section>
                    <div className='mb-4'>
                        <h1 className="font-semibold mb-1 text-3xl">Billing</h1>
                        <hr className='w-full' />
                    </div>
                    <SquareCardForm ref={paymentHandle} />
                    <div className="block">
                        <div className="my-2">
                            <div>
                                <label className="inline-flex items-center">
                                    <input
                                        {...register("address.billing_as_shipping")}
                                        defaultChecked
                                        type="checkbox"
                                        className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-offset-0 focus:ring-blue-200 focus:ring-opacity-50"
                                    />
                                    <span className="ml-2">Shipping address same as billing</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    {!sameShpppingAddress ? (
                        <AddressForm errors={errors} disabled={sameShpppingAddress} name="billing" register={register} ids={{
                            firstname: "address.billing.firstname",
                            lastname: "address.billing.lastname",
                            address1: "address.billing.address_line1",
                            address2: "address.billing.address_line2",
                            city: "address.billing.city",
                            country: "address.billing.country",
                            state: "address.billing.state",
                            postal: "address.billing.postal",
                            phone: "address.billing.phone"
                        }} />
                    ) : null}
                </section>
                <DiscountForm checkout={[checkoutState, dispatch]} />
                <section className="mb-4">
                    <ul>
                        <li className="flex flex-col gap-1">
                            <div>
                                <span className="mr-2 font-semibold">Shipping</span>
                                <button onClick={() => next(1)} className="text-primary underline">change</button>
                            </div>
                            <span className="text-gray-400">{checkoutState.address.shipping ? `${checkoutState.address.shipping?.address_line1} ${checkoutState.address.shipping?.address_line2} ${checkoutState.address.shipping?.city} ${checkoutState.address.shipping?.state} ${checkoutState.address.shipping?.postal} (${checkoutState.address.shipping?.country})` : "No address has been set."}</span>
                        </li>
                    </ul>
                </section>
                {(!checkoutState.completed.shipping || !checkoutState.completed.user) ? (
                    <div className="text-red-500 my-2 p-1">Please complete Shipping and Customer information forms to finalize order.</div>
                ) : null}
                {paymentHandle.current?.loading()}
                <div className="flex justify-between items-center">
                    <button onClick={() => next(1)} type="button" className="flex justify-center items-center text-primary">
                        <HiChevronLeft />
                        <span className="hover:underline">Back</span>
                    </button>
                    <button disabled={isSubmitting || isValidating || !paymentHandle.current?.loading() || !checkoutState.completed.shipping || !checkoutState.completed.user} className="mb-2 text-center block rounded-sm bg-primary px-6 py-4 text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" type="submit">Pay {formatPrice(netTotal ?? 0)}</button>
                </div>
            </form>
        </Tab.Panel>
    );
}

export default BillingPanel;