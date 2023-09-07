import { useRef, useState } from "react";
import { X } from "lucide-react";
import useCheckout from "@/hooks/shop/useCheckout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/Spinner";

const DiscountForm: React.FC = () => {
  const { state, dispatch } = useCheckout();

  const discountRef = useRef<HTMLInputElement>(null);
  const [discountError, setDiscountError] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  const addDiscount = async () => {
    try {
      setLoading(true);
      setDiscountError(false);
      // validate discount
      if (!discountRef.current) return;

      const response = await fetch(
        `/api/shop/discount-validate?discount=${discountRef.current.value}`,
      );

      if (!response.ok) throw new Error("Invaild discount code");

      discountRef.current.value = "";

      const code = (await response.json()) as { id: string; name: string };

      dispatch({
        event: "ADD_DISCOUNT",
        payload: { scope: "ORDER", name: code.name, id: code.id },
      });
    } catch (error) {
      console.error(error);
      setDiscountError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <div className="mb-4">
        <h1 className="mb-1 text-3xl font-semibold">Discounts</h1>
        <hr className="w-full" />
      </div>
      <div className="mb-4">
        <Label htmlFor="discount">Discount Code</Label>
        <div className="flex gap-2">
          <Input
            data-cy="discount-input"
            ref={discountRef}
            placeholder="Some discount"
            id="discount"
            type="text"
          />
          <Button
            disabled={loading}
            data-cy="discount-input-enter"
            onClick={addDiscount}
            type="button"
          >
            {loading ? <Spinner className="mr-2 h-5 w-5" /> : null}
            Apply
          </Button>
        </div>
        {discountError ? (
          <span className="mt-1 block text-red-500">Invaild code</span>
        ) : null}
      </div>
      {!!state.discounts.length ? (
        <div className="mb-4 ml-4">
          <ul>
            {state.discounts.map((discount) => (
              <li className="flex items-center" key={discount.id}>
                <Button
                  title="Remove discount"
                  aria-label={`Remove discount ${discount.name}`}
                  className="hover:text-red-600"
                  variant="ghost"
                  size="icon"
                  data-cy="discount-remove"
                  onClick={() => {
                    console.log("Remove", discount);
                    dispatch({
                      event: "REMOVE_DISCOUNT",
                      payload: discount.id,
                    });
                  }}
                  type="button"
                >
                  <X className="h-6 w-6" />
                </Button>
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
