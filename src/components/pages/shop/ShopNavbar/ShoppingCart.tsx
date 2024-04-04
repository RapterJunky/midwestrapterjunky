"use client";

import ShoppingCartItem from "../ShoppingCartItem";
import ShoppingCartItemSkeleton from "../ShoppingCartItemSkeleton";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import useCart from "@/hooks/shop/useCart";

const ShoppingCart: React.FC = () => {
  const { items, cart, isLoading, error } = useCart();

  const subtotal = useMemo(() => {
    if (!cart?.length || !items.length) return "$??.??";

    const code = cart.at(0)?.price.currency ?? "USD";

    const total =
      cart.reduce((acc, x, i) => {
        return acc + x.price.amount * (items[i]?.quantity ?? 1);
      }, 0) / 100;

    return total.toLocaleString(undefined, {
      style: "currency",
      currency: code,
    });
  }, [cart, items]);

  return (
    <>
      <div className="flex h-full flex-1 flex-col">
        {!items.length ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-blue-400 bg-black p-12 text-white">
              <ShoppingBag className="absolute h-9 w-9" />
            </span>
            <h2 className="pt-6 text-center text-2xl font-bold tracking-wide">
              Your cart is empty
            </h2>
            <p className="text-accent-3 px-10 pt-2 text-center">
              Try adding some things to it.
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-blue-400 bg-black p-12 text-white">
              <AlertTriangle className="absolute h-9 w-9" />
            </span>
            <h2 className="pt-6 text-center text-2xl font-bold tracking-wide">
              Was unable to load your cart!
            </h2>
            <p className="text-accent-3 px-10 pt-2 text-center">
              Try again later.
            </p>
          </div>
        ) : (
          <>
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              My Cart
            </h2>
            <ScrollArea className="flex-1 px-4 sm:px-6">
              <ul>
                {isLoading
                  ? items.map((_, i) => <ShoppingCartItemSkeleton key={i} />)
                  : cart?.map((item, i) => (
                      <ShoppingCartItem
                        quantity={items[i]?.quantity ?? 0}
                        item={item}
                        key={i}
                      />
                    ))}
              </ul>
            </ScrollArea>
            <div className="sticky bottom-0 left-0 right-0 z-20 w-full flex-shrink-0 border-t bg-white px-6 py-6 text-sm sm:px-6">
              <ul className="pb-2">
                <li className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span>{subtotal}</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Taxes</span>
                  <span>Calculated at checkout</span>
                </li>
                <li className="flex justify-between py-1">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </li>
              </ul>
              <div className="border-accent-2 mb-2 flex justify-between border-t py-3 font-bold">
                <span>Total</span>
                <span>{subtotal}</span>
              </div>
              <div>
                <Button asChild className="w-full">
                  <Link href="/shop/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ShoppingCart;
