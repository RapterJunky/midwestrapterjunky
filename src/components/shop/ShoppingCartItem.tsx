import Image from "next/image";
import Link from "next/link";
import { HiMinus, HiPlus, HiX } from "react-icons/hi";
import useCart, { type CartItem } from "@hook/useCart";
import useFormatPrice from "@/hooks/useFormatPrice";

const ShoppingCartItem: React.FC<{ data: CartItem, editable?: boolean }> = ({ data, editable = true }) => {
    const formatPrice = useFormatPrice(data.currency);
    const { removeFromCart, addQuantity, removeQuantity } = useCart();
    return (
        <li className="flex flex-col py-4">
            <div className="flex flex-row space-x-4 py-4">
                <div className="w-16 h-16 relative overflow-hidden cursor-pointer" style={{ backgroundColor: `#${data.labelColor}` }}>
                    <Image className="w-full h-full object-cover" height={64} width={64} src={data.image.url} alt={data.image.alt} />
                </div>
                <div className="flex-1 flex flex-col text-base">
                    <Link href={`/shop/products/${data.id}`}>
                        <span className="font-medium cursor-pointer pb-1 -mt-1">
                            {data.name}
                        </span>
                    </Link>
                    <div className="flex items-center pb-1">
                        <div className="text-xs font-semibold text-accent-7 inline-flex items-center justify-center">
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
                <div className="flex flex-row h-9">
                    <button className="flex p-1 border-gray-300 border items-center justify-center w-12 select-none hover:border-black focus:outline-none disabled:cursor-not-allowed transition-colors" onClick={() => removeFromCart(data.id, data.option.id)}>
                        <HiX className="h-5 w-5" />
                    </button>
                    <label className="w-full border-accent-2 border ml-2">
                        <input value={data.quantity} className="border-gray-300 bg-transparent px-4 w-full h-full focus:outline-none focus:ring-0 select-none pointer-events-auto" type="number" readOnly min={0} max={100} />
                    </label>
                    <button type="button" className="flex p-1 ml-1 border-gray-300 border items-center justify-center w-12 select-none hover:border-black focus:outline-none disabled:cursor-not-allowed transition-colors" onClick={() => removeQuantity(data.id, data.option.id)}>
                        <HiMinus className="h-5 w-5" />
                    </button>
                    <button className="flex p-1 ml-1 border-gray-300 border items-center justify-center w-12 select-none hover:border-black focus:outline-none disabled:cursor-not-allowed transition-colors" onClick={() => addQuantity(data.id, data.option.id)}>
                        <HiPlus className="h-5 w-5" />
                    </button>
                </div>) : null}
        </li>
    );
}

export default ShoppingCartItem;