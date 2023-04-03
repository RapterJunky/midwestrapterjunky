import { useForm } from 'react-hook-form';
import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';
import "@square/web-payments-sdk-types";
import type { Payments, CardClassSelectors } from "@square/web-payments-sdk-types";

import { CartProvider } from "@/hooks/useCart";
import { NextPageWithProvider } from "@/types/page";

type FormState = {};

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
    input: {
        "fontSize": "12px"
    },
    'input::placeholder': {
        color: '#999999',
    },
    'input.is-error': {
        color: '#ff1600',
    }
};
//https://bootsnipp.com/snippets/ypqoW
//https://react-square-payments.weareseeed.com/docs/props#optional-props
const Checkout: NextPageWithProvider = () => {
    const payments = useRef<Payments>();
    const { handleSubmit, register } = useForm<FormState>();
    const container = useRef<HTMLDivElement>(null);

    const onSubmit = async (state: FormState) => {

    }

    return (
        <div className='flex flex-col h-full'>
            <main className="flex flex-col justify-center items-center h-full">
                <form onSubmit={handleSubmit(onSubmit)} id="payment-form" className="container max-w-4xl px-4">
                    <div>
                        <div className='mb-4'>
                            <h1 className="font-semibold mb-1">Billing</h1>
                            <hr className='w-full' />
                        </div>
                        <div className="mb-2">
                            <label htmlFor='nameoncard'>
                                <span className="text-gray-700">Name on Card:</span>
                            </label>
                            <input id="nameoncard" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='John M. Doe' />
                        </div>
                        <div>
                            <label htmlFor="Card Details"></label>
                            <div ref={container} id="card-container"></div>
                        </div>
                    </div>

                    <div>
                        <div className='mb-4'>
                            <h1 className="font-semibold mb-1">Customer informations</h1>
                            <hr className='w-full' />
                        </div>
                        <div className="mb-2">
                            <label htmlFor='email'>
                                <span className="text-gray-700">Email:</span>
                            </label>
                            <input id="email" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="email" placeholder='john@example.com' />
                        </div>
                    </div>

                    <div>
                        <div className='mb-4'>
                            <h1 className="font-semibold mb-1">Shipping address</h1>
                            <hr className='w-full' />
                        </div>

                        <div className="flex gap-2 mb-2">
                            <div className='w-full'>
                                <label htmlFor='firstname'>
                                    <span className="text-gray-700">First Name:</span>
                                </label>
                                <input id="firstname" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='first name' />
                            </div>
                            <div className="w-full">
                                <label htmlFor='lastname'>
                                    <span className="text-gray-700">Last Name:</span>
                                </label>
                                <input id="lastname" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='last name' />
                            </div>
                        </div>

                        <div>
                            <div className="mb-2">
                                <label htmlFor='address'>
                                    <span className="text-gray-700">Address:</span>
                                </label>
                                <input id="address" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='542 W. 15th Street' />
                            </div>
                            <div className="mb-2">
                                <label htmlFor='address2'>
                                    <span className="text-gray-700">Address 2:</span>
                                </label>
                                <input id="address2" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='542 W. 15th Street' />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor='city'>
                                <span className="text-gray-700">City:</span>
                            </label>
                            <input id="city" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='city' />
                        </div>

                        <div className="flex gap-2">
                            <div className="mb-2 w-full">
                                <label htmlFor="county">
                                    <span className="text-gray-700">County:</span>
                                </label>
                                <select id="county" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" placeholder='New York'>
                                    <option value="us">Uninted States</option>
                                </select>
                            </div>
                            <div className="mb-2 w-full">
                                <label htmlFor='state'>
                                    <span className="text-gray-700">State:</span>
                                </label>
                                <input id="state" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='NY' />
                            </div>
                            <div className="mb-2 w-full">
                                <label htmlFor='zip'>
                                    <span className="text-gray-700">Zip / Postal Code:</span>
                                </label>
                                <input id="zip" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='10001' />
                            </div>
                        </div>

                        <div className="mb-2">
                            <label htmlFor='phone'>
                                <span className="text-gray-700">Phone:</span>
                            </label>
                            <input id="phone" className="mt-1 block w-full border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" type="text" placeholder='phone' />
                        </div>





                        <div className="block">
                            <div className="my-2">
                                <div>
                                    <label className="inline-flex items-center">
                                        <input
                                            defaultChecked
                                            type="checkbox"
                                            className="border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2">Shipping address same as billing</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="mb-2 text-center block w-full rounded bg-primary px-6 py-4 text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70" type="submit">Pay</button>
                </form>
            </main>

            <Script onLoad={() => {
                window.Square?.payments("sandbox-sq0idb-POkWEAAb7R06B2B7BOBZ0g", "L730KS46N8B3Y")
                    .card({ style: darkModeCardStyle }).then(card =>
                        card?.attach(container.current as HTMLDivElement)
                    )
            }} src="https://sandbox.web.squarecdn.com/v1/square.js" />
        </div>
    );
}

Checkout.provider = CartProvider;

export default Checkout;