"use client";

import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import type { CheckoutState } from "@/components/providers/CheckoutProvider";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import useCheckout from "@/hooks/shop/useCheckout";
import AddressForm from "@components/pages/shop/checkout/AddressForm";

const ShippingTab: React.FC = () => {
  const { state, dispatch } = useCheckout();
  const form = useForm<CheckoutState>({
    defaultValues: state,
  });

  const onSubmit = (state: CheckoutState) => {
    if (!state.shipping) {
      return form.setError("root", {
        message: "Failed to submit",
        type: "validate",
      });
    }

    dispatch({ payload: state.shipping, event: "FINSIH_SHIPPING" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="ph-no-capture">
        <AddressForm
          comments={true}
          type="shipping"
          name="Shipping"
          control={form.control}
        />
        <div className="mt-4 flex items-center justify-between">
          <Button
            onClick={() => dispatch({ event: "SET_TAB", payload: "account" })}
            type="button"
            variant="link"
          >
            <ChevronLeft className="mr-1" />
            Back
          </Button>
          <Button data-cy="checkout-next" type="submit">
            Procced to Payment
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ShippingTab;
