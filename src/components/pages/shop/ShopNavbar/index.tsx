import { ShoppingBag } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import ShoppingBagItemCount from "./ShoppingBagItemCount";
import ShopSearch from "./ShopSearch";
import ShoppingCart from "./ShoppingCart";

const ShopNavbar: React.FC = () => {
    return (
        <div className="mb-4 grid w-full grid-cols-1 justify-center rounded-sm px-4 lg:grid-cols-3">
            <ShopSearch />
            <div className="order-1 mb-4 flex w-full items-center justify-end pr-4 lg:order-none lg:mb-0">
                <Sheet>
                    <SheetTrigger title="Shopping cart" className="relative transition-transform hover:scale-110 hover:transform">
                        <ShoppingBag className="h-7 w-7" />
                        <ShoppingBagItemCount />
                    </SheetTrigger>
                    <SheetContent className="w-full md:w-screen md:max-w-md">
                        <ShoppingCart />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}

export default ShopNavbar;