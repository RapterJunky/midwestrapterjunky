"use client";
import useLocalStorageState from 'use-local-storage-state'
import { createContext } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api/fetcher';

export type CartItem = {
    /**
     * {ITEM_VARIATION_ID}
     * @type {string}
     */
    id: string;
    quantity: number;
};

type ExtendCartItem = {
    name: string;
    labelColor: string;
    option: {
        id: string;
        name: string;
        pricingType: string;
    };
    image: {
        url: string;
        alt: string;
    };
    price: number;
    currency: string;
    maxQuantity?: number;
} & CartItem;

type ShoppingCartCtx = {
    count: number;
    cart: ExtendCartItem[] | undefined,
    error: Response | undefined,
    isLoading: boolean;
    addItem: (id: string, quantity?: number) => void;
    removeItem: (id: string) => void;
    resetCart: () => void;
    open: () => void
}

const CART_STOARGE_KEY = "cart-v2";
export const ShoppingCartContext = createContext<ShoppingCartCtx | null>(null);

const ShoppingCardProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [cartItems, setCartItems, { removeItem }] = useLocalStorageState<CartItem[]>(CART_STOARGE_KEY, {
        defaultValue: []
    });
    const { data, error, isLoading } = useSWR<ExtendCartItem[], Response>(() => cartItems.length ? /*["/api/shop/cart", cartItems]*/ null : null, fetcher);

    const count = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

    return (
        <ShoppingCartContext.Provider value={{
            count,
            cart: data,
            error,
            isLoading,
            open() {
                window.dispatchEvent(new CustomEvent("shopping-cart:open"))
            },
            addItem(id, quantity = 1) {
                setCartItems(current => {
                    const idx = current.findIndex(value => value.id === id);
                    if (idx !== -1 && current[idx]) {
                        current[idx]!.quantity += quantity;
                        return [...current];
                    }

                    return [...current, { id, quantity }];
                });
            },
            removeItem(id) {
                setCartItems((current) => {
                    const item = current.findIndex(value => value.id === id);
                    if (item === -1) return current;
                    current.splice(item, 1);
                    return [...current];
                });
            },
            resetCart() {
                removeItem();
            },
        }}>
            {children}
        </ShoppingCartContext.Provider>
    );
}

export default ShoppingCardProvider;