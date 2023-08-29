import CheckoutProvider from "@/components/providers/CheckoutProvider";
import SessionProvider from "@/components/providers/SessionProvider";
import ShoppingCardProvider from "@/components/providers/ShoppingCartProvider";

const CheckoutLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <ShoppingCardProvider>
            <SessionProvider>
                <CheckoutProvider>
                    {children}
                </CheckoutProvider>
            </SessionProvider>
        </ShoppingCardProvider>
    );
}

export default CheckoutLayout;