import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import HiShoppingBag from "@components/icons/HiShoppingBag";
import ShoppingCart from "@components/shop/ShoppingCart";
import HiSearch from "@components/icons/HiSearch";
import Sidebar from "@components/ui/Sidebar";
import useCart from "@hook/useCart";

const ShopNavbar: React.FC<{ clear?: boolean }> = ({ clear = false }) => {
  const [show, setShow] = useState<boolean>(false);
  const router = useRouter();
  const { count } = useCart();

  useEffect(() => {
    const openNav = () => setShow(true);
    window.addEventListener("shop-nav:open", openNav);
    return () => {
      window.removeEventListener("shop-nav:open", openNav);
    };
  }, []);

  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.target as HTMLFormElement);
    const query = data.get("query")?.toString();
    const params = new URLSearchParams(window.location.search);

    if (clear) (ev.target as HTMLFormElement).reset();

    if (query) {
      params.set("query", query);
      router.push(`/shop?${params.toString()}`).catch((e) => console.error(e));
      return;
    }

    params.delete("query");
    router.push(`/shop?${params.toString()}`).catch((e) => console.error(e));
  };

  return (
    <>
      {show ? (
        <Sidebar onClose={() => setShow(false)} side="right">
          <ShoppingCart onClose={() => setShow(false)} />
        </Sidebar>
      ) : null}
      <div className="mb-4 grid w-full grid-cols-1 justify-center rounded-sm px-4 pb-2 shadow lg:grid-cols-3">
        <form
          className="relative order-2 flex w-full items-center rounded-sm border-2 border-gray-300 lg:order-none lg:col-start-2"
          onSubmit={onSubmit}
        >
          <label htmlFor="search" className="hidden">
            Search
          </label>
          <input
            data-cy="shop-search-input"
            id="search"
            name="query"
            placeholder="Search for products..."
            type="text"
            className="w-full border-none placeholder:text-sm focus:shadow-none focus:outline-none focus:ring-0"
            enterKeyHint="search"
          />
          <div className="pointer-events-none absolute right-0 flex">
            <HiSearch className="mx-2 h-5 w-5 text-gray-800" />
          </div>
        </form>
        <div className="order-1 mb-4 flex w-full items-center justify-end pr-4 lg:order-none lg:mb-0">
          <button
            onClick={() => setShow(true)}
            aria-label={`Cart items: ${count}`}
            className="relative transition-transform hover:scale-110 hover:transform"
          >
            <HiShoppingBag className="h-7 w-7" />
            {count >= 1 ? (
              <span className="absolute -bottom-2 -left-4 ml-2 inline-block whitespace-nowrap rounded-[0.27rem] bg-danger-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-xs font-bold leading-none text-danger-700">
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </>
  );
};

export default ShopNavbar;
