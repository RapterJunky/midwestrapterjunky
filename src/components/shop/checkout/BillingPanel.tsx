import { type CardClassSelectors, type Card, type TokenizationError } from "@square/web-payments-sdk-types";
import { useForm } from "react-hook-form";
import { Tab } from "@headlessui/react";
import { useRef, useEffect, useState } from 'react';

import type { CheckoutFormState } from "@/pages/shop/checkout";
import AddressForm from "./AddressForm";
import { HiChevronLeft, HiX } from "react-icons/hi";
import useFormatPrice from "@/hooks/useFormatPrice";
import useCart from "@/hooks/useCart";
import { useRouter } from "next/router";

type Props = {
    next: React.Dispatch<React.SetStateAction<number>>,
    selected: number;
    netTotal: number,
    state: Partial<CheckoutFormState>,
    discount: [
        Array<{ name: string; catalogObjectId: string; scope: "ORDER" }>,
        React.Dispatch<React.SetStateAction<Array<{ name: string; catalogObjectId: string; scope: "ORDER" }>>>
    ]
}

const darkModeCardStyle: CardClassSelectors = {
    '.input-container': {
        borderRadius: '2px',
    },
    '.input-container.is-focus': {
        borderColor: '#006AFF',
    },
    '.input-container.is-error': {
        borderColor: '#ff1600',
    },
    '.message-text': {
        color: '#999999',
    },
    '.message-icon': {
        color: '#999999',
    },
    '.message-text.is-error': {
        color: '#ff1600',
    },
    '.message-icon.is-error': {
        color: '#ff1600',
    },
    'input::placeholder': {
        color: '#999999',
    },
    'input.is-error': {
        color: '#ff1600',
    }
};

//https://react-square-payments.weareseeed.com/docs/props#optional-props
//https://web.dev/payment-and-address-form-best-practices/#html-elements
//https://developer.squareup.com/docs/devtools/sandbox/payments
const BillingPanel: React.FC<Props> = ({ next, selected, state, discount: [discounts, setDiscount], netTotal }) => {
    const { data } = useCart();
    const router = useRouter();
    const discountRef = useRef<HTMLInputElement>(null);
    const [discountError, setDiscountError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const formatPrice = useFormatPrice("USD");
    const [error, setLoadingError] = useState<string>();
    const container = useRef<HTMLDivElement>(null);
    const card = useRef<Card>();
    const { handleSubmit, register, watch, formState: { errors, isSubmitting, isValidating }, setError } = useForm<CheckoutFormState>({
        defaultValues: {
            ...state,
            billing: {
                billing_as_shipping: true
            }
        }
    });
    const sameShpppingAddress = watch("billing.billing_as_shipping");

    useEffect(() => {
        if (selected === 2 && !card.current) {

            let payments;
            try {
                payments = window.Square?.payments("sandbox-sq0idb-POkWEAAb7R06B2B7BOBZ0g", "L730KS46N8B3Y")
            } catch (error) {
                const statusContainer = document.getElementById(
                    'payment-status-container'
                );
                if (!statusContainer) return;
                statusContainer.className = 'missing-credentials';
                statusContainer.style.visibility = 'visible';
            }

            payments?.card({ style: darkModeCardStyle }).then(payment => {
                setLoading(false);
                payment.attach(container.current as HTMLDivElement);
                card.current = payment;
            }).catch(value => {
                console.error(value);
                setLoadingError("There was an error, please reload page.");
            });
        }
        return () => {
            if (card.current) {
                card.current.destroy();
                card.current = undefined;
            }
        }
    }, [selected]);

    const handleBilling = async (formState: CheckoutFormState) => {
        if (!card.current) return;

        try {
            const result = await card.current.tokenize();

            if (result.status !== "OK") {
                let errorMessage = `Tokenization failed with status: ${result.status}`;
                if (result.errors) {
                    errorMessage += ` and errors: ${JSON.stringify(
                        result.errors
                    )}`;

                    console.error(errorMessage);
                    const statusContainer = document.getElementById(
                        'payment-status-container'
                    );

                    if (!statusContainer) return;

                    statusContainer.classList.remove('is-success');
                    statusContainer.classList.add('is-failure');
                    statusContainer.style.visibility = 'visible';
                }
                return;
            }

            const response = await fetch("/api/ship/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    location_id: "L730KS46N8B3Y",
                    source_id: result.token,
                    checkout_id: router.query.checkoutId,
                    order: data.map(value => ({
                        catalogObjectId: value.option.id,
                        quantity: value.quantity,
                        basePriceMoney: {
                            amount: value.price,
                            currency: "USD"
                        }
                    })),
                    discounts: discounts,
                    details: {
                        ...state,
                        billing: {
                            ...state.billing,
                            name: formState.billing.name
                        }
                    }
                })
            });

            if (!response.ok) {
                throw response;
            }

            window.localStorage.removeItem("cart");
            // router

        } catch (error) {
            if ("errors" in (error as TokenizationError)) {
                setError("billing.token", {
                    message: (error as TokenizationError).message,
                    type: "validate",
                });
                return;
            }

            console.error(error);
            return;
        }
    }

    return (
        <Tab.Panel className="flex flex-col justify-center items-center">
            <form className='w-full' onSubmit={handleSubmit(handleBilling)}>
                <div className='mb-4'>
                    <h1 className="font-semibold mb-1 text-3xl">Billing</h1>
                    <hr className='w-full' />
                </div>
                <div className="mb-4">
                    <label htmlFor='nameoncard' className="text-gray-700">
                        Name on Card
                    </label>
                    <input required {...register("billing.name", { required: "A name is required." })} autoComplete="cc-name" id="nameoncard" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='John M. Doe' />
                    {errors.billing?.name ? (
                        <span className="text-red-500 mt-1 block">{errors.billing?.name.message}</span>
                    ) : null}
                </div>
                <div>
                    <label className="text-gray-700" htmlFor="card-container">Card Details</label>
                    {loading ? (
                        <div className="flex items-center justify-center h-24">
                            <div
                                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                role="status">
                                <span
                                    className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                                >Loading...</span
                                >
                            </div>
                        </div>
                    ) : null}
                    {error || errors.billing?.token ? (
                        <div className="w-full text-center p-2 text-red-500">
                            {error ?? errors.billing?.token?.message}
                        </div>
                    ) : null}
                    <div className="shadow-square-input mt-1" id="card-container" ref={container} />
                </div>
                <div className="block">
                    <div className="my-2">
                        <div>
                            <label className="inline-flex items-center">
                                <input
                                    {...register("billing.billing_as_shipping")}
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
                        name: "billing.address.name",
                        address1: "billing.address.address_line1",
                        address2: "billing.address.address_line2",
                        city: "billing.address.city",
                        country: "billing.address.country",
                        phone: "billing.address.phone",
                        state: "billing.address.state",
                        postal: "billing.address.postal"
                    }} />
                ) : null}
                <div className='mb-4'>
                    <h1 className="font-semibold mb-1 text-3xl">Discounts</h1>
                    <hr className='w-full' />
                </div>
                <div className="mb-4">
                    <label className="text-gray-700" htmlFor="discount">Discount Code</label>
                    <div className="flex">
                        <input ref={discountRef} placeholder="Some discount" id="discount" type="text" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50" />
                        <button onClick={async () => {
                            setDiscountError(false);
                            // validate discount
                            if (!discountRef.current) return;

                            const response = await fetch(`/api/shop/discount-validate?discount=${discountRef.current.value}`);

                            if (!response.ok) {
                                setDiscountError(true);
                                return;
                            }

                            discountRef.current.value = "";
                            const code = await response.json() as { id: string; name: string; }
                            setDiscount(current => {
                                return [{ scope: "ORDER", name: code.name, catalogObjectId: code.id }, ...current];
                            });
                        }} type="button" className="bg-primary text-white mt-1 block shadow-sm py-2 px-3 rounded-r-sm hover:bg-primary-600">Apply</button>
                    </div>
                    {discountError ? (<span className="block text-red-500 mt-1">Invaild code</span>) : null}
                </div>
                {!!discounts.length ? (
                    <div className="mb-4 ml-4">
                        <ul>
                            {discounts.map(discount => (
                                <li className="flex items-center" key={discount.catalogObjectId}>
                                    <button onClick={() => setDiscount((current) => current.filter(value => value.catalogObjectId !== discount.catalogObjectId))} type="button" className="hover:text-red-600" aria-label="Remove discount">
                                        <HiX className="h-6 w-6" />
                                    </button>
                                    <span>{discount.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>) : null}
                <div className="mb-4">
                    <ul>
                        <li className="flex flex-col gap-1">
                            <div>
                                <span className="mr-2 font-semibold">Shipping</span>
                                <button onClick={() => next(1)} className="text-primary underline">change</button>
                            </div>
                            <span className="text-gray-400">{state.shipping_details ? `${state.shipping_details?.address_line1} ${state.shipping_details?.address_line2} ${state.shipping_details?.city} ${state.shipping_details?.state} ${state.shipping_details?.postal} (${state.shipping_details?.country})` : "No address has been set."}</span>
                        </li>
                    </ul>
                </div>
                {(!state.ready?.shipping || !state.ready?.user) ? (
                    <div className="text-red-500 my-2 p-1">Please complete Shipping and Customer information forms to finalize order.</div>
                ) : null}
                <div className="flex justify-between items-center">
                    <button onClick={() => next(1)} type="button" className="flex justify-center items-center text-primary">
                        <HiChevronLeft />
                        <span className="hover:underline">Back</span>
                    </button>
                    <button disabled={isSubmitting || isValidating || loading || !state.ready?.shipping || !state.ready?.user} className="mb-2 text-center block rounded-sm bg-primary px-6 py-4 text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" type="submit">Pay {formatPrice(netTotal ?? 0)}</button>
                </div>
            </form>
        </Tab.Panel>
    );
}

export default BillingPanel;