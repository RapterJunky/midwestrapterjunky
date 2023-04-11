import { HiX } from "react-icons/hi";
import Link from "next/link";
import { HiShoppingBag, HiOutlineShoppingBag } from "react-icons/hi2";

import ShoppingCartItem from "@components/shop/ShoppingCartItem";
import useCart from "@hook/useCart";
import useFormatPrice from "@/hooks/useFormatPrice";

type Props = {
  onClose: () => void;
};

const ShoppingCart: React.FC<Props> = ({ onClose }) => {
  const { data, count, isEmpty, subtotal } = useCart();
  const formatPrice = useFormatPrice("USD");
  return (
    <div className="relative flex h-full flex-col">
      <header className="sticky top-0 z-10 box-border flex min-h-[66px] w-full items-center justify-between bg-white py-4 pl-4 pr-6 lg:min-h-[74px]">
        <button
          onClick={onClose}
          aria-label="Close"
          type="button"
          className="mr-6 flex items-center transition duration-150 ease-in-out focus:outline-none"
        >
          <HiX className="h-6 w-6 hover:text-gray-300" />
          <span className="ml-2 text-sm text-gray-500 ">Close</span>
        </button>

        <div className="relative">
          <HiShoppingBag className="h-7 w-7" />
          {count >= 1 ? (
            <span className="absolute -bottom-2 -left-4 ml-2 inline-block whitespace-nowrap rounded-[0.27rem] bg-danger-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-xs font-bold leading-none text-danger-700">
              {count}
            </span>
          ) : null}
        </div>
      </header>
      <div className="flex flex-1 flex-col">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-blue-400 bg-black p-12 text-white">
              <HiOutlineShoppingBag className="absolute h-9 w-9" />
            </span>
            <h2 className="pt-6 text-center text-2xl font-bold tracking-wide">
              Your cart is empty
            </h2>
            <p className="text-accent-3 px-10 pt-2 text-center">
              Try adding some things to it.
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 px-4 sm:px-6">
              <h2 className="mb-2 pb-2 text-2xl font-bold">My Cart</h2>
              <ul className="">
                {data.map((item, i) => (
                  <ShoppingCartItem data={item} key={i} />
                ))}
              </ul>
            </div>
            <div className="sticky bottom-0 left-0 right-0 z-20 w-full flex-shrink-0 border-t bg-white px-6 py-6 text-sm sm:px-6">
              <ul className="pb-2">
                <li className="flex justify-between py-1">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
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
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div>
                <Link
                  href={{
                    pathname: "/shop/checkout",
                    query: {
                      checkoutId: window.crypto.randomUUID(),
                    },
                  }}
                  className="mb-2 block w-full rounded-sm bg-primary px-6 py-4 text-center text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ShoppingCart;
