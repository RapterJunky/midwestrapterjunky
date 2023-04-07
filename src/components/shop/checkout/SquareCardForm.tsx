import type { CardClassSelectors, Card, Payments } from "@square/web-payments-sdk-types";
import { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';

import type { Address, CheckoutState } from "@/pages/shop/checkout";

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

const SquareCardForm: React.FC<React.PropsWithRef<any>> = forwardRef((_, ref) => {
    const abortController = useRef(new AbortController());
    const [error, setError] = useState<string | undefined>();
    const container = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);
    const payments = useRef<Payments>();
    const cardPayment = useRef<Card>();

    useImperativeHandle(ref, () => {
        return {
            loading: () => loading,

            /**
            * @throws — {PaymentMethodNotAttachedError} Card is not attached to a DOM element
            * @throws — {PaymentMethodAlreadyDestroyedError} Card has already been destroyed
            * @throws — {TokenizationError} Tokenization of the payment card failed
            * @throws — {VerifyBuyerError} Something went wrong trying to verify the buyer
            */
            async tokenize(email: string, billing: Address, amount: number, currencyCode: string): Promise<{ token: string; verificationToken: string; }> {
                setError(undefined); // clear Errors

                if (!cardPayment.current || !payments.current) {
                    setError("Square SDK failed to load properly.");
                    throw new Error("Square SDK failed to load properly.");
                }

                const result = await cardPayment.current.tokenize().catch((e) => {
                    if (e && typeof e === "object" && "name" in e) {
                        if (e.name === "TokenizationError") {
                            setError(e.message);
                        } else {
                            setError("Payment Server Failed to start");
                        }
                    }
                    throw e;
                });

                if (result.status !== "OK" || !result.token) {
                    let errorMessage = `Tokenization failed with status: ${result.status}`;
                    if (result.errors) {
                        errorMessage += ` and errors: ${JSON.stringify(
                            result.errors
                        )}`;
                    }
                    setError(errorMessage);
                    throw new Error(errorMessage);
                }

                const verificationToken = await payments.current.verifyBuyer(result.token, {
                    amount: (amount / 100).toFixed(2),
                    billingContact: {
                        addressLines: [billing.address_line1, billing.address_line2].filter(Boolean),
                        city: billing.city,
                        countryCode: billing.country,
                        email,
                        familyName: billing.lastname,
                        givenName: billing.firstname,
                        phone: billing.phone,
                        postalCode: billing.postal.toString(),
                        state: billing.state
                    },
                    currencyCode,
                    intent: "CHARGE"
                }).catch((e) => {
                    if (e && typeof e === "object" && "name" in e) {
                        setError(e.message);
                    }
                    throw e;
                });

                if (!verificationToken?.token) throw new Error("No verification token");

                return {
                    verificationToken: verificationToken.token,
                    token: result.token
                }
            }
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                setError(undefined); // clear errors

                abortController.current.signal.throwIfAborted();
                if (!window.Square) throw new Error("Square SDK failed to load properly.");

                payments.current = window.Square.payments("sandbox-sq0idb-POkWEAAb7R06B2B7BOBZ0g", "L730KS46N8B3Y");

                cardPayment.current = await payments.current.card({ style: darkModeCardStyle });

                if (!container.current) throw new Error("No element to attach form to.")

                await cardPayment.current.attach(container.current);

            } catch (e) {
                if (!e || !(typeof e === "object" && "name" in e)) return;
                switch (e.name) {
                    // Ignore AbortError as we know this is not really an error.
                    case "AbortError":
                        return;
                    case "BrowserNotSupportedError":
                        setError("The current browser is not supported for payments.");
                        break;
                    default:
                        setError("Failed to load payment service.");
                        break;
                }
                console.error(e);

            } finally {
                setLoading(false);
            }
        }
        if (!cardPayment.current) init();

        return () => {
            abortController.current.abort();
            if (cardPayment.current) cardPayment.current.destroy();
        }
    }, []);

    return (
        <div className="w-full">
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
            <div className="shadow-square-input mt-1" id="card-container" ref={container} />
            {error ? <div className="text-red-500 w-full text-center p-2">{error}</div> : null}
        </div>
    );
});

export default SquareCardForm;