"use client";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ExtendCartItem } from "@/components/providers/ShoppingCartProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useCart from "@/hooks/shop/useCart";

const ShoppingCartItem: React.FC<{ item: ExtendCartItem, quantity: number }> = ({ item, quantity }) => {
    const { removeItem, decQuantity, incQuantity } = useCart();

    const max = item.maxQuantity ? item.maxQuantity : Infinity;

    return (
        <li className="flex flex-col pb-2">
            <div className="flex flex-row space-x-4 py-4">
                <div className="relative h-16 w-16 cursor-pointer overflow-hidden" style={{ backgroundColor: `#${item.labelColor}` }}>
                    <Image
                        className="h-full w-full object-cover"
                        height={64}
                        width={64}
                        src={item.image.url}
                        alt={item.image.name}
                    />
                </div>
                <div className="flex flex-1 flex-col text-base">
                    <Link href={`/shop/products/${item.parentId}`}>
                        <span className="-mt-1 cursor-pointer pb-1 font-medium">
                            {item.name}
                        </span>
                    </Link>
                    <div className="flex items-center pb-1">
                        <div className="text-accent-7 inline-flex items-center justify-center text-xs font-semibold">
                            {item.variation}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col justify-between space-y-2 text-sm">
                    <span>{((item.price.amount * quantity) / 100).toLocaleString(undefined, {
                        style: "currency",
                        currency: "USD"
                    })}</span>
                </div>
            </div>
            <div className="flex h-9 flex-row gap-1">
                <Button className="w-16" type="button" onClick={() => removeItem(item.id)} size="icon" variant="destructive">
                    <X className="h-5 w-5" />
                </Button>
                <Input value={quantity} type="number" readOnly />
                <Button className="w-16" type="button" size="icon" disabled={quantity <= 1} onClick={() => decQuantity(item.id)}>
                    <Minus />
                </Button>
                <Button className="w-16" type="button" size="icon" disabled={quantity >= max} onClick={() => incQuantity(item.id)}>
                    <Plus />
                </Button>
            </div>
        </li>
    );
}

export default ShoppingCartItem;