import { useState, useContext, createContext } from 'react';

export type CartItem = {
    id: string;
    name: string;
    labelColor: string;
    option: {
        id: string;
        name: string;
    }
    image: {
        url: string;
        alt: string;
    };
    price: number;
    currency: string;
    quantity: number;
};
type CartCtx = {
    count: number;
    subtotal: number;
    items: CartItem[],
    addToCart(item: CartItem): Promise<void>
    removeFromCart(id: string, option_id: string): Promise<void>
    addQuantity(id: string, option_id: string, amount?: number): void;
    removeQuantity(id: string, option_id: string, amount?: number): void
}

const CartContext = createContext<CartCtx | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
    const subtotal = items.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            count,
            subtotal,
            async addToCart(item) {
                setItems((current) => {
                    const exists = current.find(value => value.id === item.id && value.option.id === item.option.id);
                    if (exists) {
                        exists.quantity += item.quantity;
                        return [...current];
                    }
                    return [item, ...current];
                })
            },
            async removeFromCart(id: string, option_id: string) {
                setItems((current) => {
                    const item = current.findIndex(value => value.id === id && value.option.id === option_id);
                    if (item !== -1) {
                        return [
                            ...current.slice(undefined, item),
                            ...current.slice(item + 1)
                        ];
                    }
                    return current;
                });
            },
            addQuantity(id: string, option_id: string, amount: number = 1) {
                setItems((current) => {
                    const exists = current.find(value => value.id === id && value.option.id === option_id);
                    if (exists) {
                        exists.quantity += amount;
                        return [...current];
                    }
                    return current;
                });
            },
            removeQuantity(id: string, option_id: string, amount: number = 1) {
                setItems((current) => {
                    const exists = current.find(value => value.id === id && value.option.id === option_id);
                    if (exists) {
                        const value = exists.quantity - amount;
                        if (value <= 0) return current;
                        exists.quantity = value;
                        return [...current];
                    }
                    return current;
                });
            }
        }}>
            {children}
        </CartContext.Provider>
    );
}

const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used with in a CartProvider");

    return {
        openCart: () => window.dispatchEvent(new CustomEvent("shop-nav:open")),
        data: ctx.items,
        count: ctx.count,
        isEmpty: !ctx.items.length,
        subtotal: ctx.subtotal,
        addToCart: ctx.addToCart,
        removeFromCart: ctx.removeFromCart,
        addQuantity: ctx.addQuantity,
        removeQuantity: ctx.removeQuantity
    }
}

export default useCart;