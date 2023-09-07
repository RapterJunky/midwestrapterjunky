"use client";
import { useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import useCheckout from "@/hooks/shop/useCheckout";
import ShoppingCartItem from "../ShoppingCartItem";
import ShoppingCartItemSkeleton from "../ShoppingCartItemSkeleton";

const RenderMoney: React.FC<{
  code: string;
  value: bigint | null | undefined | string;
  isLoading: boolean;
  error: Response | undefined;
}> = ({ code, value, isLoading, error }) => {
  if (!value) return "Nothing to calculate."
  if (error) return "Failed to calculate.";
  if (isLoading) return "Calculating...";
  if (Number.isNaN(value)) return "Unable to calculate.";

  const valueFormated = (Number(value) / 100).toLocaleString(undefined, {
    style: "currency",
    currency: code,
  });

  return <>{valueFormated}</>;
};

const Calculation: React.FC = () => {
  const {
    state,
    cart,
    order: { data, isLoading, error },
  } = useCheckout();

  const currency = state.currencyCode;

  const subtotal = useMemo(() => {
    if (!data) return "??";

    const total =
      data.lineItems?.reduce((acc, x) => {
        return acc + (Number(x.variationTotalPriceMoney?.amount) ?? 0);
      }, 0) ?? 0;

    return (total / 100).toLocaleString(undefined, {
      style: "currency",
      currency,
    });
  }, [data, currency]);

  return (
    <section className="order-1 col-span-1 flex w-full justify-start p-6 lg:order-none">
      <div className="w-full">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Cart
        </h1>
        <Separator />
        <ul>
          {isLoading
            ? cart.items.map((_, i) => <ShoppingCartItemSkeleton key={i} />)
            : cart.cart?.map((value, i) => (
              <ShoppingCartItem
                key={i}
                item={value}
                quantity={cart.items[i]?.quantity ?? 0}
              />
            ))}
        </ul>
        <Separator />
        <ul className="pb-2">
          <li className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>{isLoading ? "Loading" : subtotal}</span>
          </li>
          {state.discounts.length ? (
            <li className="flex justify-between py-1">
              <span>Discount</span>
              <span>
                -
                <RenderMoney
                  isLoading={isLoading}
                  error={error}
                  code={state.currencyCode}
                  value={data?.totalDiscountMoney?.amount}
                />
              </span>
            </li>
          ) : null}
          <li className="flex justify-between py-1">
            <span>Taxes</span>
            <span>
              <RenderMoney
                isLoading={isLoading}
                error={error}
                code={state.currencyCode}
                value={data?.totalTaxMoney?.amount}
              />
            </span>
          </li>
          <li className="flex justify-between py-1">
            <span>Service Charges</span>
            <span>
              <RenderMoney
                isLoading={isLoading}
                error={error}
                code={state.currencyCode}
                value={data?.totalServiceChargeMoney?.amount}
              />
            </span>
          </li>
        </ul>
        <div className="border-accent-2 mb-2 flex justify-between border-t py-3">
          <span>Total</span>
          <span>
            USD{" "}
            <span className="font-bold tracking-wide">
              <RenderMoney
                isLoading={isLoading}
                error={error}
                code={state.currencyCode}
                value={data?.netAmountDueMoney?.amount}
              />
            </span>
          </span>
        </div>
      </div>
    </section>
  );
};

export default Calculation;
