"use client";
import type { CardClassSelectors } from "@square/web-payments-sdk-types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import useCheckout from "@/hooks/shop/useCheckout";

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
  const [loading, setLoading] = useState(true);
  const { paymentApi, setCard } = useCheckout();

  useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    const init = async (signal: AbortSignal) => {
      try {
        setLoading(true);

        const cardItem = await paymentApi
          ?.card({ style: cardStyle })
          .then((res) => {
            if (!signal.aborted) {
              setCard(res);
              return res;
            }
            return null;
          });

        await cardItem?.attach(`#sqaure-card-container`);

        const cssId = document
          .getElementById("sqaure-card-container")
          ?.children[0]?.getAttribute("id");

        for (const sheet of document.head.querySelectorAll(
          `style[id^="sq-single-card-custom-styles-"]`,
        )) {
          const id = sheet.getAttribute("id");
          if (id !== cssId) sheet.remove();
        }

        if (signal.aborted) {
          await cardItem?.destroy();
        }
      } catch (error) {
        console.log(error);
        throw new Error("Failed to load payment form");
      } finally {
        setLoading(false);
      }
    };

    init(signal).catch((e) => console.error(e));

    return () => {
      abortController.abort();
    };
  }, [paymentApi, setCard]);

  return (
    <>
      <div
        data-cy="billing-card-details"
        data-status={loading ? "loading" : "ready"}
        className={`ph-no-capture shadow-square-input mt-1 ${loading ? "hidden" : ""}`}
        id="sqaure-card-container"
      />
      {loading ? (
        <div className="grid w-full grid-cols-2 divide-x divide-y divide-zinc-200 rounded-sm border border-zinc-300 sm:grid-cols-3">
          <Skeleton className="col-span-2 h-12 w-full sm:col-span-1" />
          <Skeleton className="h-12 w-full p-2" />
          <Skeleton className="h-12 w-full p-2" />
        </div>
      ) : null}
    </>
  );
};

export default SquareForm;
