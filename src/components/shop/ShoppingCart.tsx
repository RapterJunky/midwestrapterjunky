import { HiX } from "react-icons/hi";
import Link from "next/link";
import { HiShoppingBag, HiOutlineShoppingBag } from 'react-icons/hi2';

import ShoppingCartItem from '@components/shop/ShoppingCartItem';
import useCart from "@hook/useCart";
import useFormatPrice from "@/hooks/useFormatPrice";

type Props = {
    onClose: () => void;
}

const ShoppingCart: React.FC<Props> = ({ onClose }) => {
    const { data, count, isEmpty, subtotal } = useCart();
    const formatPrice = useFormatPrice("USD");
    return (
        <div className="relative h-full flex flex-col">
            <header className="sticky top-0 pl-4 py-4 pr-6 flex items-center justify-between box-border w-full z-10 min-h-[66px] lg:min-h-[74px] bg-white">
                <button onClick={onClose} aria-label="Close" type="button" className="transition ease-in-out duration-150 flex items-center focus:outline-none mr-6">
                    <HiX className="h-6 w-6 hover:text-gray-300" />
                    <span className="ml-2 text-gray-500 text-sm ">Close</span>
                </button>

                <div className="relative">
                    <HiShoppingBag className="h-7 w-7" />
                    {count >= 1 ? (<span className="ml-2 absolute -left-4 -bottom-2 inline-block whitespace-nowrap rounded-[0.27rem] bg-danger-100 px-[0.65em] pt-[0.35em] pb-[0.25em] text-center align-baseline text-xs font-bold leading-none text-danger-700">{count}</span>) : null}
                </div>
            </header>
            <div className="flex flex-col flex-1">
                {isEmpty ? (
                    <div className="flex-1 px-4 flex flex-col justify-center items-center">
                        <span className="border border-dashed border-blue-400 rounded-full flex items-center justify-center w-16 h-16 p-12 bg-black text-white">
                            <HiOutlineShoppingBag className="absolute h-9 w-9" />
                        </span>
                        <h2 className="pt-6 text-2xl font-bold tracking-wide text-center">
                            Your cart is empty
                        </h2>
                        <p className="text-accent-3 px-10 text-center pt-2">
                            Try adding some things to it.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="px-4 sm:px-6 flex-1">
                            <h2 className="font-bold text-2xl mb-2 pb-2">
                                My Cart
                            </h2>
                            <ul className="">
                                {data!.map((item, i) => (
                                    <ShoppingCartItem data={item} key={i} />
                                ))}
                            </ul>
                        </div>
                        <div className="flex-shrink-0 px-6 py-6 sm:px-6 sticky z-20 bottom-0 w-full right-0 left-0 bg-white border-t text-sm">
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
                                    <span className="font-bold tracking-wide">FREE</span>
                                </li>
                            </ul>
                            <div className="flex justify-between border-t border-accent-2 py-3 font-bold mb-2">
                                <span>Total</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div>
                                <Link href="/shop/checkout" className="mb-2 text-center block w-full rounded bg-primary px-6 py-4 text-sm font-medium uppercase leading-normal text-white shadow transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70">
                                    Proceed to Checkout
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ShoppingCart;