"use client";
import { X } from "lucide-react";
import { useState } from "react";
import useCheckout from "@/hooks/shop/useCheckout";
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DiscountForm: React.FC = () => {
  const { state, dispatch } = useCheckout();
  const [discountName, setDsicountName] = useState<string>();
  const [discountError, setDiscountError] = useState<boolean>(false);

  const addDiscount = async () => {
    try {
      setDiscountError(false);
      // validate discount
      if (!discountName || !discountName.length) return;

      const response = await fetch(
        `/api/shop/discount-validate?discount=${discountName}`,
      );

      if (!response.ok) throw new Error("Invaild discount code");

      setDsicountName("");

      const code = (await response.json()) as { id: string; name: string };

      dispatch({
        event: "ADD_DISCOUNT",
        payload: { scope: "ORDER", name: code.name, id: code.id },
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
        <FormLabel>Discounts</FormLabel>
        <div className="flex gap-1">
          <Input placeholder="Enter code" value={discountName} onChange={(ev) => setDsicountName(ev.target.value)} />
          <Button data-cy="discount-input-enter" onClick={addDiscount}>Apply</Button>
        </div>
        {discountError ? (
          <span className="mt-1 block text-red-500">Invaild code</span>
        ) : null}
      </div>
      <div className="mb-4 ml-4">
        <ul className="divide-y divide-zinc-300">
          {state.discounts.map((value, i) => (
            <li key={i} className="w-full flex justify-between p-2">
              <div>Code: {value.name}</div>
              <Button onClick={() => dispatch({ event: "REMOVE_DISCOUNT", payload: value.id })} aria-label="Remove discount" size="icon" variant="destructive">
                <X />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default DiscountForm;
