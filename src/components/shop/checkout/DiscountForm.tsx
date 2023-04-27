import { useRef, useState } from "react";
import HiX from "@components/icons/HiX";
import type { CheckoutAction, CheckoutState } from "@/pages/shop/checkout";

type Props = {
  checkout: [
    CheckoutState,
    React.Dispatch<{ type: CheckoutAction; payload: string | object }>
  ];
};

const DiscountForm: React.FC<Props> = ({
  checkout: [checkoutState, dispatch],
}) => {
  const discountRef = useRef<HTMLInputElement>(null);
  const [discountError, setDiscountError] = useState<boolean>(false);

  const addDiscount = async () => {
    try {
      setDiscountError(false);
      // validate discount
      if (!discountRef.current) return;

      const response = await fetch(
        `/api/shop/discount-validate?discount=${discountRef.current.value}`
      );

      if (!response.ok) throw new Error("Invaild discount code");

      discountRef.current.value = "";

      const code = (await response.json()) as { id: string; name: string };

      dispatch({
        type: "addDiscount",
        payload: { scope: "ORDER", name: code.name, catalogObjectId: code.id },
      });
    } catch (error) {
      console.error(error);
      setDiscountError(true);
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h1 className="mb-1 text-3xl font-semibold">Discounts</h1>
        <hr className="w-full" />
      </div>
      <div className="mb-4">
        <label className="text-gray-700" htmlFor="discount">
          Discount Code
        </label>
        <div className="flex">
          <input
            data-cy="discount-input"
            ref={discountRef}
            placeholder="Some discount"
            id="discount"
            type="text"
            className="mt-1 block w-full border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          <button
            data-cy="discount-input-enter"
            onClick={addDiscount}
            type="button"
            className="mt-1 block rounded-r-sm bg-primary px-3 py-2 text-white shadow-sm hover:bg-primary-600"
          >
            Apply
          </button>
        </div>
        {discountError ? (
          <span className="mt-1 block text-red-500">Invaild code</span>
        ) : null}
      </div>
      {!!checkoutState.discounts.length ? (
        <div className="mb-4 ml-4">
          <ul>
            {checkoutState.discounts.map((discount) => (
              <li className="flex items-center" key={discount.catalogObjectId}>
                <button
                  data-cy="discount-remove"
                  onClick={() =>
                    dispatch({
                      type: "removeDiscount",
                      payload: discount.catalogObjectId,
                    })
                  }
                  type="button"
                  className="hover:text-red-600"
                  aria-label="Remove discount"
                >
                  <HiX className="h-6 w-6" />
                </button>
                <span>{discount.name}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
};

export default DiscountForm;
