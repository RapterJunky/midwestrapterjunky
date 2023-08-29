"use client";
import { Separator } from "@/components/ui/separator";
import useCheckout from "@/hooks/shop/useCheckout";

const Calculation: React.FC = () => {
    const { state, order, calLoading, calError } = useCheckout();


    return (
        <section className="order-1 col-span-1 flex w-full justify-start p-6 lg:order-none">
            <div className="w-full">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">Cart</h1>
                <Separator />
                {/** Shopping Cart Itmes */}
                <Separator />
                <ul className="pb-2">
                    <li className="flex justify-between py-1">
                        <span>Subtotal</span>
                        <span>{order?.totalMoney?.amount as number}</span>
                    </li>
                    {state.discounts.length ? (
                        <li className="flex justify-between py-1">
                            <span>Discount</span>
                            <span>
                                -
                                {calLoading ? "Calculating..." : calError ? ("Failed to calculate.") : (
                                    (Number(order?.totalDiscountMoney?.amount) / 100).toLocaleString(undefined, {
                                        style: "currency",
                                        currency: state.currencyCode
                                    })
                                )}
                            </span>
                        </li>
                    ) : null}
                    <li className="flex justify-between py-1">
                        <span>Taxes</span>
                        <span>
                            {calLoading ? "Calculating..." : calError ? ("Failed to calculate.") : (
                                (Number(order?.totalTaxMoney?.amount) / 100).toLocaleString(undefined, {
                                    style: "currency",
                                    currency: state.currencyCode
                                })
                            )}
                        </span>
                    </li>
                    <li className="flex justify-between py-1">
                        <span>Service Charges</span>
                        <span>
                            {calLoading ? "Calculating..." : calError ? ("Failed to calculate.") : (
                                (Number(order?.totalServiceChargeMoney?.amount) / 100).toLocaleString(undefined, {
                                    style: "currency",
                                    currency: state.currencyCode
                                })
                            )}
                        </span>
                    </li>
                </ul>
                <div className="border-accent-2 mb-2 flex justify-between border-t py-3">
                    <span>Total</span>
                    <span>
                        USD{" "}
                        <span className="font-bold tracking-wide">
                            {calLoading ? "Calculating..." : calError ? ("Failed to calculate.") : (
                                (Number(order?.netAmountDueMoney?.amount) / 100).toLocaleString(undefined, {
                                    style: "currency",
                                    currency: state.currencyCode
                                })
                            )}
                        </span>
                    </span>
                </div>
            </div>
        </section>
    );
}

export default Calculation;