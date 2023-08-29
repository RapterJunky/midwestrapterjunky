import { useContext } from "react"
import { checkoutContext } from "@/components/providers/CheckoutProvider";

const useCheckout = () => {
    const ctx = useContext(checkoutContext);
    if (!ctx) throw new Error("useCheckout needs to be wrapped in a Checkout Provider");
    return ctx;
}

export default useCheckout;