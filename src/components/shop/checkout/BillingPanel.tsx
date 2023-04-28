import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { useState } from "react";

import HiChevronLeft from "@components/icons/HiChevronLeft";
import CheckoutModal from "./CheckoutModal";
import DiscountForm from "./DiscountForm";
import AddressForm from "./AddressForm";

import type {
  CheckoutState,
  CheckoutAction,
  Address,
} from "@/pages/shop/checkout";
import useFormatPrice from "@hook/useFormatPrice";
import useSquareSDK from "@hook/useSquareSDK";
import useCart from "@hook/useCart";

type Props = {
  next: React.Dispatch<React.SetStateAction<number>>;
  selected: number;
  netTotal: number;
  checkout: [
    CheckoutState,
    React.Dispatch<{ type: CheckoutAction; payload: string | object }>
  ];
  active: boolean;
};

const errorResponses = {
  ADDRESS_VERIFICATION_FAILURE: {
    message:
      "The card issuer declined the request because the postal code is invaild.",
    type: "user",
  },
  CARDHOLDER_INSUFFICIENT_PERMISSIONS: {
    message:
      "The card issuer has declined the transaction due to restrictions on where the card can be used.",
    type: "user",
  },
  CARD_EXPIRED: {
    message: "The card issuer declned the request because the card is expired.",
    type: "user",
  },
  CARD_NOT_SUPPORTED: {
    message:
      "The card is not supported either in the geographic region or by the MCC.",
    type: "user",
  },
  CVV_FAILURE: {
    message:
      "The card issuer declined the request because the CVV value is invaild.",
    type: "user",
  },
  EXPIRATION_FAILURE: {
    message:
      "The card issuer declined the request because the CVV value is invaild.",
    type: "user",
  },
  GENERIC_DECLINE: {
    message: "The card was declined.",
    type: "user",
  },
  INSUFFICIENT_FUNDS: {
    message: "Insufficient Funds",
    type: "user",
  },
  INVALID_ACCOUNT: {
    message: "The issuer was not able to locate the account on record",
    type: "user",
  },
  INVALID_CARD: {
    message:
      "The credit card cannot be validated based on the provided details.",
    type: "user",
  },
  INVALID_CARD_DATA: {
    message: "The provided card data is invaild.",
    type: "user",
  },
  INVALID_EXPIRATION: {
    message: "The expiration date for the payment card is invaild.",
    type: "user",
  },
  INVALID_PIN: {
    message: "The card issuer declined the request because the PIN is invaild.",
    type: "user",
  },
  INVALID_POSTAL_CODE: {
    message: "The postal code is incorrectyl formatted.",
    type: "user",
  },
  PAN_FAILURE: {
    message: "The specified card number is invaild.",
    type: "user",
  },
  TRANSACTION_LIMIT: {
    message:
      "The card issuer has determined the payment amount is either too hight or too low.",
    type: "user",
  },
  VOICE_FAILURE: {
    message:
      "The card issuer declined the request because the issuer requires voice authorization from cardholder.",
    type: "user",
  },
  ALLOWABLE_PIN_TRIES_EXCEEDED: {
    message:
      "The card has exhausted its available pin entry retries set by the card issuer.",
    type: "user",
  },
  BAD_EXPIRATION: {
    message:
      "The card expiration date is either missing or incorrectyl formatted.",
    type: "user",
  },
  CARD_DECLINED_VERIFICATION_REQUIRED: {
    message:
      "The payment card was declined with a request for additional verification.",
    type: "user",
  },
  INVALID_EMAIL_ADDRESS: {
    message: "The provider email address is invaild",
    type: "user-other",
  },
  PAYMENT_LIMIT_EXCEEDED: {
    message:
      "The payment was declined because the payment amount execeeded the processing limit for this merchant.",
    type: "service",
  },
  MANUALLY_ENTERED_PAYMENT_NOT_SUPPORTED: {
    message: "The card must be swiped, tapped or dipped.",
    type: "retry",
  },
  IDEMPOTENCY_KEY_REUSED: {
    message: "There was an temporary internal error. Please try again.",
    type: "retry",
  },
  TEMPORARY_ERROR: {
    message: "There was an temporary internal error. Please try again.",
    type: "retry",
  },
  CARD_TOKEN_EXPIRED: {
    message: "Please try again. Checkout was expired.",
    type: "retry",
  },
  CHIP_INSERTION_REQUIRED: {
    message:
      "The card issuer requires that the card be read using a chip reader.",
    type: "retry",
  },
  GIFT_CARD_AVAILABLE_AMOUNT: {
    message: "Cannot take partial payment with a tip with a gift card.",
    type: "retry",
  },
  CARD_TOKEN_USED: {
    message: "The payment was already processed.",
    type: "exit",
  },
  INSUFFICIENT_PERMISSIONS: {
    message:
      "The payment processer does not have permissions to accept this payment.",
    type: "exit",
  },
  INVALID_FEES: {
    message: "Unable to process payment.",
    type: "exit",
  },
  INVALID_LOCATION: {
    message: "Can not take payments from the specified region.",
    type: "exit",
  },
  PAYMENT_AMOUNT_MISMATCH: {
    message:
      "The payment was declined because there was a payment amount mismatch.",
    type: "exit",
  },
  CARD_PROCESSING_NOT_ENABLED: {
    message: "Unable to be processed due to card processing not being enabled.",
    type: "exit",
  },
};

//https://react-square-payments.weareseeed.com/docs/props#optional-props
//https://web.dev/payment-and-address-form-best-practices/#html-elements
//https://developer.squareup.com/docs/devtools/sandbox/payments
const BillingPanel: React.FC<Props> = ({
  next,
  checkout: [checkoutState, dispatch],
  netTotal,
  active,
}) => {
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors, isSubmitting, isValidating },
  } = useForm<CheckoutState>({
    defaultValues: checkoutState,
  });
  const sameShpppingAddress = watch("address.billing_as_shipping");
  const { tokenize, container, loading, error, setError } =
    useSquareSDK(active);
  const formatPrice = useFormatPrice("USD");
  const [isOpen, setIsOpen] = useState(false);
  const [modalData, setModalData] = useState<{ message: string; type: string }>(
    {
      message: "An error occured when trying to process the payment.",
      type: "service",
    }
  );
  const router = useRouter();
  const { data } = useCart();

  const handleBilling = async (formState: CheckoutState) => {
    try {
      setError(undefined);
      if (loading) throw new Error("Payment service is not set!");
      if (
        !checkoutState.email ||
        !checkoutState.completed.shipping ||
        !router.query.checkoutId
      )
        throw new Error("Misssing form values");

      setIsOpen(true);

      const { sourceVerification, source } = await tokenize(
        checkoutState.email,
        formState.address.billing_as_shipping
          ? (checkoutState.address.shipping as Address)
          : (formState.address.billing as Address),
        netTotal,
        "USD"
      );

      const response = await fetch("/api/shop/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_verification: sourceVerification,
          location_id: process.env.NEXT_PUBLIC_SQAURE_LOCATION_ID,
          source_id: source,
          checkout_id: router.query.checkoutId,
          items: data.map((item) => ({
            pricingType: item.option.pricingType,
            catalogObjectId: item.option.id,
            quantity: item.quantity,
          })),
          discounts: checkoutState.discounts,
          address: {
            shipping: checkoutState.address.shipping,
            billing_as_shipping: formState.address.billing_as_shipping,
            billing: formState.address?.billing,
          },
          email: checkoutState.email,
        }),
      });

      if (!response.ok) {
        const errors = (await response.json()) as {
          message: string;
          details: [{ code: string; detail: string; category: string }];
        };

        let card_errors = "";
        const status_errors = errors.details.map(
          (value) =>
            errorResponses[value.code as keyof typeof errorResponses] ?? {
              message: "An error occured when trying to process.",
              type: "service",
            }
        );

        for (const error of status_errors) {
          if (error.type !== "user") continue;
          card_errors += error.message + "\n";
        }

        if (status_errors.some((value) => value.type === "user")) {
          setError(card_errors);
        }

        if (
          errors.details.some(
            (value) => value.code === "IDEMPOTENCY_KEY_REUSED"
          )
        )
          await router.push(
            {
              pathname: "/shop/checkout",
              query: {
                checkoutId: crypto.randomUUID(),
              },
            },
            undefined,
            { shallow: true }
          );

        setModalData(
          status_errors[0] ?? {
            message: "An error occured when trying to process.",
            type: "service",
          }
        );

        throw response;
      }

      const result = (await response.json()) as {
        receiptNumber: string;
        receiptUrl: string;
        totalMoney: { amount: string; currency: string };
        status: string;
      };
      window.localStorage.removeItem("cart");

      await router.replace({
        pathname: "/confirmation",
        query: {
          mode: "shop",
          status: "ok",
          message: encodeURIComponent("Order make successfully"),
          shop_receipt_id: result.receiptNumber,
          shop_receipt: encodeURIComponent(result.receiptUrl),
        },
      });
    } catch (error) {
      console.error(error);
      if (error instanceof Response) return;
      setModalData({
        type: "retry",
        message: "There was an error. Please try again.",
      });
    }
  };

  return (
    <div
      id="tab-3"
      role="tabpanel"
      aria-labelledby="tab-btn-3"
      tabIndex={2}
      data-headlessui-state={active ? "selected" : undefined}
      className={`${
        active ? "flex" : "hidden"
      } flex-col items-center justify-center`}
    >
      <CheckoutModal
        asLoading={isSubmitting}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        message={modalData.message}
        type={modalData.type}
      />
      <form className="w-full" onSubmit={handleSubmit(handleBilling)}>
        <section>
          <div className="mb-4">
            <h1 className="mb-1 text-3xl font-semibold">Billing</h1>
            <hr className="w-full" />
          </div>

          <div className="w-full">
            <label className="text-gray-700" htmlFor="card-container">
              Card Details
            </label>
            {loading ? (
              <div className="flex h-36 flex-col items-center justify-center lg:h-[93px]">
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                  role="status"
                >
                  <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                    Loading...
                  </span>
                </div>
                <span className="mt-2 block text-xs">
                  Loading payment service.
                </span>
              </div>
            ) : null}
            <div
              data-cy="billing-card-details"
              data-status={loading ? "loading" : "ready"}
              className="shadow-square-input mt-1"
              id="card-container"
              ref={container}
            />
            {error ? (
              <div className="w-full whitespace-pre-line p-2 text-red-500">
                {error}
              </div>
            ) : null}
          </div>

          <div className="block">
            <div className="my-2">
              <div>
                <label className="inline-flex items-center">
                  <input
                    data-cy="checkout-billing-as-shipping"
                    {...register("address.billing_as_shipping")}
                    defaultChecked
                    type="checkbox"
                    className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 focus:ring-offset-0"
                  />
                  <span className="ml-2">Shipping address same as billing</span>
                </label>
              </div>
            </div>
          </div>
          {!sameShpppingAddress ? (
            <AddressForm
              errors={errors}
              disabled={sameShpppingAddress}
              name="billing"
              register={register}
              ids={{
                firstname: "address.billing.firstname",
                lastname: "address.billing.lastname",
                address1: "address.billing.address_line1",
                address2: "address.billing.address_line2",
                city: "address.billing.city",
                country: "address.billing.country",
                state: "address.billing.state",
                postal: "address.billing.postal",
                phone: "address.billing.phone",
              }}
            />
          ) : null}
        </section>
        <DiscountForm checkout={[checkoutState, dispatch]} />
        <section className="mb-4">
          <ul>
            <li className="flex flex-col gap-1">
              <div>
                <span className="mr-2 font-semibold">Shipping</span>
                <button
                  aria-label="Change Shipping Address"
                  data-cy="checkout-to-shipping"
                  onClick={() => next(1)}
                  className="text-primary underline"
                >
                  change
                </button>
              </div>
              <span className="text-gray-400">
                {checkoutState.address.shipping
                  ? `${checkoutState.address.shipping?.address_line1} ${checkoutState.address.shipping?.address_line2} ${checkoutState.address.shipping?.city} ${checkoutState.address.shipping?.state} ${checkoutState.address.shipping?.postal} (${checkoutState.address.shipping?.country})`
                  : "No address has been set."}
              </span>
            </li>
          </ul>
        </section>
        {!checkoutState.completed.shipping || !checkoutState.completed.user ? (
          <div className="my-2 p-1 text-red-500">
            Please complete Shipping and Customer information forms to finalize
            order.
          </div>
        ) : null}
        <div className="flex items-center justify-between">
          <button
            onClick={() => next(1)}
            type="button"
            className="flex items-center justify-center text-primary"
          >
            <HiChevronLeft />
            <span className="hover:underline">Back</span>
          </button>
          <button
            data-cy="checkout-pay"
            disabled={
              isSubmitting ||
              isValidating ||
              loading ||
              !checkoutState.completed.shipping ||
              !checkoutState.completed.user
            }
            className="mb-2 block rounded-sm bg-primary px-6 py-4 text-center text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
            type="submit"
          >
            Pay {formatPrice(netTotal ?? 0)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingPanel;
