import Image from "next/image";
import Link from "next/link";
import { HiMinus, HiPlus, HiX } from "react-icons/hi";
import useCart, { type CartItem } from "@hook/useCart";
import useFormatPrice from "@/hooks/useFormatPrice";

const ShoppingCartItem: React.FC<{ data: CartItem; editable?: boolean }> = ({
  data,
  editable = true,
}) => {
  const formatPrice = useFormatPrice(data.currency);
  const { removeFromCart, addQuantity, removeQuantity } = useCart();
  return (
    <li className="flex flex-col pb-2">
      <div className="flex flex-row space-x-4 py-4">
        <div
          className="relative h-16 w-16 cursor-pointer overflow-hidden"
          style={{ backgroundColor: `#${data.labelColor}` }}
        >
          <Image
            className="h-full w-full object-cover"
            height={64}
            width={64}
            src={data.image.url}
            alt={data.image.alt}
          />
        </div>
        <div className="flex flex-1 flex-col text-base">
          <Link href={`/shop/products/${data.id}`}>
            <span className="-mt-1 cursor-pointer pb-1 font-medium">
              {data.name}
            </span>
          </Link>
          <div className="flex items-center pb-1">
            <div className="text-accent-7 inline-flex items-center justify-center text-xs font-semibold">
              {data.option.name}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between space-y-2 text-sm">
          <span>{formatPrice(data.price * data.quantity)}</span>
        </div>
      </div>
      {/** Quantity */}
      {editable ? (
        <div className="flex h-9 flex-row">
          <button
            className="flex w-12 select-none items-center justify-center border border-gray-300 p-1 transition-colors hover:border-black focus:outline-none disabled:cursor-not-allowed"
            onClick={() => removeFromCart(data.id, data.option.id)}
          >
            <HiX className="h-5 w-5" />
          </button>
          <label className="border-accent-2 ml-2 w-full border">
            <input
              value={data.quantity}
              className="pointer-events-auto h-full w-full select-none border-gray-300 bg-transparent px-4 focus:outline-none focus:ring-0"
              type="number"
              readOnly
              min={0}
              max={100}
            />
          </label>
          <button
            type="button"
            className="ml-1 flex w-12 select-none items-center justify-center border border-gray-300 p-1 transition-colors hover:border-black focus:outline-none disabled:cursor-not-allowed"
            onClick={() => removeQuantity(data.id, data.option.id)}
          >
            <HiMinus className="h-5 w-5" />
          </button>
          <button
            className="ml-1 flex w-12 select-none items-center justify-center border border-gray-300 p-1 transition-colors hover:border-black focus:outline-none disabled:cursor-not-allowed"
            onClick={() => addQuantity(data.id, data.option.id)}
          >
            <HiPlus className="h-5 w-5" />
          </button>
        </div>
      ) : null}
    </li>
  );
};

export default ShoppingCartItem;
