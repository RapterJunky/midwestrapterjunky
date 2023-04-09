import { useState, useContext, createContext, useEffect } from "react";

export type CartItem = {
  id: string;
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
  quantity: number;
};
type CartCtx = {
  count: number;
  loading: boolean;
  subtotal: number;
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, option_id: string) => void;
  addQuantity: (id: string, option_id: string, amount?: number) => void;
  removeQuantity: (id: string, option_id: string, amount?: number) => void;
};

const CartContext = createContext<CartCtx | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CartItem[]>([]);

  const setData = (data: (prevState: CartItem[]) => CartItem[]) => {
    setItems((current) => {
      const item = data(current);
      if (!!item.length)
        window.localStorage.setItem("cart", JSON.stringify(item));
      return item;
    });
  };

  const count = items.reduce((acc, curr) => acc + curr.quantity, 0);
  const subtotal = items.reduce(
    (acc, curr) => acc + curr.price * curr.quantity,
    0
  );

  useEffect(() => {
    if (window) {
      const data = window.localStorage.getItem("cart");
      if (!data) {
        setLoading(false);
        return;
      }
      const cart = JSON.parse(data);
      if (Array.isArray(cart)) setItems(cart as CartItem[]);
      setLoading(false);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        subtotal,
        loading,
        addToCart: (item) => {
          setData((current) => {
            const exists = current.find(
              (value) =>
                value.id === item.id && value.option.id === item.option.id
            );
            if (exists) {
              exists.quantity += item.quantity;
              return [...current];
            }
            return [item, ...current];
          });
        },
        removeFromCart: (id: string, option_id: string) => {
          setData((current) => {
            const item = current.findIndex(
              (value) => value.id === id && value.option.id === option_id
            );
            if (item !== -1) {
              return [
                ...current.slice(undefined, item),
                ...current.slice(item + 1),
              ];
            }
            return current;
          });
        },
        addQuantity: (id: string, option_id: string, amount = 1) => {
          setData((current) => {
            const exists = current.find(
              (value) => value.id === id && value.option.id === option_id
            );
            if (exists) {
              exists.quantity += amount;
              return [...current];
            }
            return current;
          });
        },
        removeQuantity: (id: string, option_id: string, amount = 1) => {
          setData((current) => {
            const exists = current.find(
              (value) => value.id === id && value.option.id === option_id
            );
            if (exists) {
              const value = exists.quantity - amount;
              if (value <= 0) return current;
              exists.quantity = value;
              return [...current];
            }
            return current;
          });
        },
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

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
    removeQuantity: ctx.removeQuantity,
    loading: ctx.loading,
  };
};

export default useCart;
