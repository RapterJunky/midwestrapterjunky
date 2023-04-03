import Link from "next/link";
import Image from 'next/image';
import { HiPlusCircle } from "react-icons/hi";
import useCart from "@/hooks/useCart";


interface Props {
    name?: string;
    id?: string;
    price?: string;
    category?: string | null
    image?: {
        url: string;
        alt: string;
    } | null,
}

const ShopCard: React.FC<Props> = ({ name = "Title", id = "", image, price, category }) => {
    const { addToCart } = useCart();
    return (
        <Link className="animate-in fade-in shadow z-0" href={`/shop/product/${id}`}>
            <div className="relative w-full h-56">
                <Image className="object-center object-cover" src={image?.url ?? `https://api.dicebear.com/6.x/icons/png?seed=${name}`} fill alt={image?.alt ?? "product"} sizes='((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em' />
            </div>
            <div className="p-2">
                <h1 className="font-bold">{name}</h1>
                <span className="text-xs text-gray-800">{category ?? "General"}</span>
                <div className='w-full flex justify-end mt-4'>
                    <span>{price ?? "$??.??"}</span>
                </div>
            </div>
        </Link>
    );
}

export default ShopCard;