"use client";
import { ChevronLeft } from "lucide-react";
import SquareForm from "@/components/pages/shop/checkout/SquareForm";
import type { CheckoutState } from "@/components/providers/CheckoutProvider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import useCheckout from "@/hooks/shop/useCheckout";
import { useForm } from "react-hook-form";
import AddressForm from "./AddressForm";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import DiscountForm from "@/components/shop/checkout/DiscountForm";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ShopLoadingDialog from "./ShopLoadingDialog";
import ErrorDialog from "./ErrorDialog";
import { useState } from "react";
import Spinner from "@components/ui/Spinner";

const BillingTab: React.FC = () => {
  const [error, setError] = useState<{ message: string; code: string }>();
  const [errorDialog, setErrorDialog] = useState(false);
  const router = useRouter();
  const { state, dispatch, makePayment, order } = useCheckout();
  const form = useForm<CheckoutState>({
    defaultValues: state,
  });

  const shippingAsBilling = form.watch("billingAsShipping");

  const onSubmit = async (value: CheckoutState) => {
    setErrorDialog(false);

    dispatch({
      event: "FINISH_BILLING",
      payload: {
        billing: value.billing,
        billingAsShipping: value.billingAsShipping,
      },
    });

    try {
      const result = await makePayment();

      const query = new URLSearchParams();

      query.set("mode", "shop");
      query.set("status", "ok");
      query.set("message", encodeURIComponent("Order made successfully"));
      query.set("shop_receipt_id", result.receiptNumber);
      query.set("shop_receipt", encodeURIComponent(result.receiptUrl));

      router.replace(`/confirmation?${query.toString()}`);
    } catch (error) {
      setError({
        message: (error as Error).message,
        code: ((error as Error)?.cause as string) ?? "UNKOWN_ERROR",
      });
      setErrorDialog(true);
    }
  };

  return (
    <Form {...form}>
      <ErrorDialog
        open={errorDialog}
        setOpen={setErrorDialog}
        message={error?.message ?? "A Unknown error as happend."}
        code={error?.code ?? "UNKNOWN"}
      />
      <ShopLoadingDialog open={form.formState.isSubmitting} />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4">
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Billing
          </h1>
          <Separator />
        </div>
        <FormLabel>Card Details</FormLabel>
        <SquareForm />

        <FormField
          control={form.control}
          name="billingAsShipping"
          render={({ field }) => (
            <FormItem className="mb-4 flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  className="mt-2"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel>Shipping address same as billing</FormLabel>
              <FormMessage></FormMessage>
            </FormItem>
          )}
        />

        {!shippingAsBilling ? (
          <AddressForm
            control={form.control}
            type="billing"
            name="Billing"
            comments={false}
          />
        ) : null}

        <DiscountForm />

        <section className="mb-4">
          <ul>
            <li className="flex flex-col gap-1">
              <div>
                <span className="mr-2 font-semibold">Shipping</span>
                <Button
                  size="sm"
                  variant="link"
                  aria-label="Change Shipping Address"
                  data-cy="checkout-to-shipping"
                  onClick={() =>
                    dispatch({ event: "SET_TAB", payload: "shipping" })
                  }
                  className="text-blue-500 hover:text-blue-400"
                >
                  change
                </Button>
              </div>
              <span className="text-gray-400">
                {state.shipping
                  ? `${state.shipping?.address_line} ${state.shipping?.address_line2} ${state.shipping?.city} ${state.shipping?.state} ${state.shipping?.postalCode} (${state.shipping?.country})`
                  : "No address has been set."}
              </span>
            </li>
          </ul>
        </section>
        {!state.done.shipping || !state.done.account ? (
          <div className="my-2 p-1 text-red-500">
            Please complete Shipping and Customer information forms to finalize
            order.
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <Button
            variant="link"
            onClick={() => dispatch({ event: "SET_TAB", payload: "shipping" })}
            type="button"
          >
            <ChevronLeft />
            <span className="hover:underline">Back</span>
          </Button>
          <Button
            data-cy="checkout-pay"
            disabled={
              form.formState.isSubmitting ||
              form.formState.isValidating ||
              order.isLoading ||
              !state.done.shipping ||
              !state.done.account
            }
            type="submit"
          >
            {form.formState.isSubmitting ||
            form.formState.isValidating ||
            order.isLoading ? (
              <>
                <Spinner className="mr-2" />
                {order.isLoading ? "Loading Order" : "Processing Order"}
              </>
            ) : (
              <>
                Pay{" "}
                {(
                  Number(order.data?.netAmountDueMoney?.amount) / 100
                ).toLocaleString(undefined, {
                  style: "currency",
                  currency: state.currencyCode,
                })}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BillingTab;
