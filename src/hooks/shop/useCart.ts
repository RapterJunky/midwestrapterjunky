import { useContext } from "react";
import { ShoppingCartContext } from "@/components/providers/ShoppingCartProvider";

const useCart = () => {
  const ctx = useContext(ShoppingCartContext);
  if (!ctx)
    throw new Error(
      "hook useCart needs to be wrapped in a ShoppingCartProvider",
    );
  return ctx;
};

export default useCart;
