import { ShoppingBag } from "lucide-react";

import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import ShopSearch from "./ShopSearch";

const ShopNavbar: React.FC = () => {

    const count = 0;

    return (
        <div className="mb-4 grid w-full grid-cols-1 justify-center rounded-sm px-4 lg:grid-cols-3">
            <ShopSearch />
            <div className="order-1 mb-4 flex w-full items-center justify-end pr-4 lg:order-none lg:mb-0">
                <Sheet>
                    <SheetTrigger title="Shopping cart" className="relative transition-transform hover:scale-110 hover:transform">
                        <ShoppingBag className="h-7 w-7" />
                        {count >= 1 ? (
                            <span className="absolute -bottom-2 -left-4 ml-2 inline-block whitespace-nowrap rounded-[0.27rem] bg-red-100 px-[0.65em] pb-[0.25em] pt-[0.35em] text-center align-baseline text-xs font-bold leading-none text-red-700">
                                {count}
                            </span>
                        ) : null}
                    </SheetTrigger>
                    <SheetContent>

                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}

export default ShopNavbar;