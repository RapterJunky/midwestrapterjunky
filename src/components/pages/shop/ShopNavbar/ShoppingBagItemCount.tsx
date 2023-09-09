"use client";
import useCart from "@/hooks/shop/useCart";

const ShoppingBagItemCount: React.FC = () => {
  const { count } = useCart();

  if (count >= 1)
    return (
      <span className="absolute -bottom-2 -left-4 ml-2 inline-block whitespace-nowrap rounded-[0.27rem] bg-red-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-xs font-bold leading-none text-red-700">
        {count}
      </span>
    );
  return null;
};
export default ShoppingBagItemCount;
