import AddressForm from "@components/shop/checkout/AddressForm";
import { useForm } from "react-hook-form";
import HiChevronLeft from "@/components/icons/HiChevronLeft";

import type {
  CheckoutState,
  CheckoutAction,
  Address,
} from "@/pages/shop/checkout";

type Props = {
  next: React.Dispatch<React.SetStateAction<number>>;
  checkout: [
    CheckoutState,
    React.Dispatch<{ type: CheckoutAction; payload: string | object }>,
  ];
  active: boolean;
};

const ShippingPanel: React.FC<Props> = ({
  next,
  checkout: [checkoutState, dispatch],
  active,
}) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<CheckoutState>({
    defaultValues: checkoutState,
  });

  const handleShipping = (state: CheckoutState) => {
    dispatch({
      type: "setCompleted",
      payload: { type: "shipping", value: true },
    });
    dispatch({
      type: "setAddressShipping",
      payload: state.address.shipping as Address,
    });

    next(2);
  };

  return (
    <div
      id="tab-2"
      role="tabpanel"
      tabIndex={1}
      aria-labelledby="tab-btn-2"
      data-headlessui-state={active ? "selected" : undefined}
      className={active ? undefined : "hidden"}
    >
      <form onSubmit={handleSubmit(handleShipping)}>
        <AddressForm
          errors={errors}
          name="shipping"
          register={register}
          ids={{
            firstname: "address.shipping.firstname",
            lastname: "address.shipping.lastname",
            address1: "address.shipping.address_line1",
            address2: "address.shipping.address_line2",
            city: "address.shipping.city",
            country: "address.shipping.country",
            state: "address.shipping.state",
            postal: "address.shipping.postal",
            phone: "address.shipping.phone",
            notes: "address.shipping.comments",
          }}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={() => next(0)}
            type="button"
            className="flex items-center justify-center text-primary"
          >
            <HiChevronLeft />
            <span className="hover:underline">Back</span>
          </button>
          <button
            data-cy="checkout-next"
            className="mb-2 block rounded-sm bg-primary px-6 py-4 text-center text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
            type="submit"
          >
            Procced to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShippingPanel;
