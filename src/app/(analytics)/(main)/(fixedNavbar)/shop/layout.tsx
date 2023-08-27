import ShopNavbar from "@/components/pages/shop/ShopNavbar";
import { Separator } from "@/components/ui/separator";

const ShopLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <>
            <ShopNavbar />
            <Separator />
            {children}
        </>
    );
}

export default ShopLayout;