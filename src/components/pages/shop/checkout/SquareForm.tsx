"use client";
import type { CardClassSelectors } from "@square/web-payments-sdk-types";
import { useContext, useEffect } from "react";
import { checkoutContext } from "@/components/providers/CheckoutProvider";

const cardStyle: CardClassSelectors = {
    ".input-container": {
        borderRadius: "2px",
    },
    ".input-container.is-focus": {
        borderColor: "#006AFF",
    },
    ".input-container.is-error": {
        borderColor: "#ff1600",
    },
    ".message-text": {
        color: "#999999",
    },
    ".message-icon": {
        color: "#999999",
    },
    ".message-text.is-error": {
        color: "#ff1600",
    },
    ".message-icon.is-error": {
        color: "#ff1600",
    },
    "input::placeholder": {
        color: "#999999",
    },
    "input.is-error": {
        color: "#ff1600",
    },
};

const SquareForm: React.FC = () => {
    const ctx = useContext(checkoutContext);
    if (!ctx) throw new Error("useCartApi needs to wrapped in a provider");

    const { paymentApi, setCard } = ctx;

    useEffect(() => {
        const abortController = new AbortController();
        const { signal } = abortController;

        const init = async (signal: AbortSignal) => {
            const cardItem = await paymentApi?.card({ style: cardStyle }).then(res => {
                if (!signal.aborted) {
                    setCard(res);
                    return res;
                }
                return null;
            });

            await cardItem?.attach(`#sqaure-card-container`);

            const cssId = document.getElementById("sqaure-card-container")?.children[0]?.getAttribute("id");

            for (const sheet of document.head.querySelectorAll(`style[id^="sq-single-card-custom-styles-"]`)) {
                const id = sheet.getAttribute("id");
                if (id !== cssId) sheet.remove();
            }

            if (signal.aborted) {
                await cardItem?.destroy();
            }
        }

        init(signal).catch(e => console.error(e));

        return () => {
            abortController.abort();
        }
    }, [paymentApi, setCard]);

    return (
        <div
            data-cy="billing-card-details"
            data-status={true ? "loading" : "ready"}
            className="shadow-square-input mt-1"
            id="sqaure-card-container"
        />
    );
}

export default SquareForm;