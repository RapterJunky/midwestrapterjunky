"use client";
import { Tabs } from "@/components/ui/tabs"

import useCheckout from "@/hooks/shop/useCheckout";

const CheckoutTabs: React.FC<React.PropsWithChildren> = ({ children }) => {
    const { state, dispatch } = useCheckout();
    return (
        <Tabs defaultValue="account" value={state.tab} onValueChange={(value) => dispatch({ event: "SET_TAB", payload: value as "account" | "shipping" | "billing" })}>
            {children}
        </Tabs>
    );

}

export default CheckoutTabs