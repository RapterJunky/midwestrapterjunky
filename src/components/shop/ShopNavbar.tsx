import { useRouter } from 'next/router';
import { useState, useEffect } from "react";
import { HiSearch } from "react-icons/hi";
import { HiShoppingBag } from 'react-icons/hi2';

import Sidebar from "@components/ui/Sidebar";
import ShoppingCart from "@components/shop/ShoppingCart";
import useCart from '@/hooks/useCart';

const ShopNavbar: React.FC<{ clear?: boolean }> = ({ clear = false }) => {
    const [show, setShow] = useState<boolean>(false);
    const router = useRouter();
    const { count } = useCart();

    useEffect(() => {
        const openNav = () => setShow(true);
        window.addEventListener("shop-nav:open", openNav);
        return () => {
            window.removeEventListener("shop-nav:open", openNav);
        }
    }, []);

    const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
        ev.preventDefault();
        const data = new FormData(ev.target as HTMLFormElement);
        const query = data.get("query")?.toString();
        const params = new URLSearchParams(window.location.search);

        if (clear) (ev.target as HTMLFormElement).reset();

        if (query) {
            params.set("query", query);
            router.push(`/shop/search?${params.toString()}`);
            return;
        }

        params.delete("query");
        router.push(`/shop/search?${params.toString()}`);

    };

    return (
        <>
            {show ? (
                <Sidebar onClose={() => setShow(false)} side="right">
                    <ShoppingCart onClose={() => setShow(false)} />
                </Sidebar>
            ) : null}
            <div className='grid justify-center rounded-sm pb-2 mb-4 w-full px-4 grid-cols-1 lg:grid-cols-3 shadow'>
                <form className="border-2 border-gray-300 flex items-center w-full rounded-sm relative order-2 lg:col-start-2 lg:order-none" onSubmit={onSubmit}>
                    <label htmlFor="search" className="hidden">Search</label>
                    <input id="search" name="query" placeholder='Search for products...' type="text" className="border-none placeholder:text-sm focus:outline-none focus:shadow-none focus:ring-0 w-full" />
                    <div className="absolute flex right-0 pointer-events-none">
                        <HiSearch className="h-5 w-5 mx-2 text-gray-800" />
                    </div>
                </form>
                <div className="order-1 w-full flex justify-end items-center pr-4 mb-4 lg:mb-0 lg:order-none">
                    <button onClick={() => setShow(true)} aria-label='Shopping Cart' className="transition-transform hover:transform hover:scale-110 relative">
                        <HiShoppingBag className="h-7 w-7" />
                        {count >= 1 ? (<span className="ml-2 absolute -left-4 -bottom-2 inline-block whitespace-nowrap rounded-[0.27rem] bg-danger-100 px-[0.65em] pt-[0.35em] pb-[0.25em] text-center align-baseline text-xs font-bold leading-none text-danger-700">{count}</span>) : null}
                    </button>
                </div>
            </div>
        </>
    );
}

export default ShopNavbar;