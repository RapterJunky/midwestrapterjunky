"use client";
import { ChevronLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import type { CheckoutState } from "@/components/providers/CheckoutProvider";
import AddressForm from "@components/pages/shop/checkout/AddressForm";
import useCheckout from "@/hooks/shop/useCheckout";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

const ShippingTab: React.FC = () => {
  const { state, dispatch } = useCheckout();
  const form = useForm<CheckoutState>({
    defaultValues: state,
  });

  const onSubmit = (state: CheckoutState) => {
    dispatch({ payload: state.shipping, event: "FINSIH_SHIPPING" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
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
