import type {
  CardClassSelectors,
  Card,
  Payments,
} from "@square/web-payments-sdk-types";
import { useRef, useEffect, useState, createContext, useContext } from "react";
import Script from "next/script";

import type { Address } from "@/pages/shop/checkout";

type SquareSDKContextProps = {
  loading: boolean;
  error: string | undefined;
  payments: Payments | undefined;
  setLoading: (value: boolean) => void;
  setError: (value: string | undefined) => void;
};

const SquareSDKContext = createContext<SquareSDKContextProps | undefined>(
  undefined
);

const darkModeCardStyle: CardClassSelectors = {
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

export const SquareSDKProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);
  const [payments, setPayments] = useState<Payments>();

  return (
    <SquareSDKContext.Provider
      value={{
        loading,
        error,
        payments,
        setLoading,
        setError,
      }}
    >
      {children}
      <Script
        onReady={() => {
          try {
            if (!window.Square) throw new Error("Failed to init Square SDK");
            setPayments(
              window.Square.payments(
                process.env.NEXT_PUBLIC_SQUARE_APPID,
                process.env.NEXT_PUBLIC_SQAURE_LOCATION_ID
              )
            );
          } catch (e) {
            console.error(e);
          }
        }}
        src={`https://${
          process.env.NEXT_PUBLIC_SQUARE_MODE === "sandbox" ? "sandbox." : ""
        }web.squarecdn.com/v1/square.js`}
      />
    </SquareSDKContext.Provider>
  );
};

const useSquareSDK = (active: boolean) => {
  const container = useRef<HTMLDivElement>(null);
  const loaded = useRef<boolean>(false);
  const card = useRef<Card>();
  const ctx = useContext(SquareSDKContext);
  if (!ctx) throw new Error("useSquareSDK needs to be wrapped in a provider.");
  const setLoading = ctx.setLoading;
  const setError = ctx.setError;
  const payment = ctx.payments;

  useEffect(() => {
    const wrapper = container.current;
    if (wrapper && payment && active && !card.current && !loaded.current) {
      void (async () => {
        try {
          setLoading(true);
          card.current = await payment.card({ style: darkModeCardStyle });
          await card.current.attach(wrapper);
        } catch (e) {
          console.error(e);
          setError((e as Error).message);
        } finally {
          setLoading(false);
        }
      })();
      loaded.current = true;
    }
    return () => {
      card.current?.destroy().catch((e) => console.error(e));
      // Get rid of all the custom css generate by the square payments sdk
      if (wrapper) {
        const cssId = wrapper.children[0]
          ?.getAttribute("id")
          ?.replace("single-card-wrapper-", "");
        if (cssId)
          document.head
            .querySelector(`style[id="sq-single-card-custom-styles-${cssId}"]`)
            ?.remove();
      }
      card.current = undefined;
      loaded.current = active;
    };
  }, [active, payment, setError, setLoading]);

  return {
    loading: ctx.loading,
    container,
    error: ctx.error,
    setError,
    tokenize: async (
      email: string,
      billing: Address,
      amount: number,
      currencyCode: string
    ): Promise<{ source: string; sourceVerification: string }> => {
      ctx.setError(undefined);

      if (!ctx.payments || !card.current) {
        ctx.setError("Square SDK failed to load properly.");
        throw new Error("Square SDK failed to load properly.");
      }

      const result = await card.current.tokenize().catch((e) => {
        if (e instanceof Error) {
          if (e.name === "TokenizationError") {
            ctx.setError(e.message);
          } else {
            ctx.setError("Payment Server Failed to start");
          }
        }
        throw e;
      });

      if (result.status !== "OK" || !result.token) {
        let errorMessage = `Tokenization failed with status: ${result.status}`;
        if (result.errors) {
          errorMessage += ` and errors: ${JSON.stringify(result.errors)}`;
        }
        ctx.setError(errorMessage);
        throw new Error(errorMessage);
      }

      const verificationToken = await ctx.payments
        .verifyBuyer(result.token, {
          amount: (amount / 100).toFixed(2),
          billingContact: {
            addressLines: [billing.address_line1, billing.address_line2].filter(
              Boolean
            ),
            city: billing.city,
            countryCode: billing.country,
            email,
            familyName: billing.lastname,
            givenName: billing.firstname,
            phone: billing.phone,
            postalCode: billing.postal.toString(),
            state: billing.state,
          },
          currencyCode,
          intent: "CHARGE",
        })
        .catch((e) => {
          if (e instanceof Error) {
            ctx.setError(e.message);
          }
          throw e;
        });

      if (!verificationToken?.token) throw new Error("No verification token");

      return {
        sourceVerification: verificationToken.token,
        source: result.token,
      };
    },
  };
};

export default useSquareSDK;