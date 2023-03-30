import Link from "next/link";
import Image from 'next/image';
import { HiPlusCircle } from "react-icons/hi";

const ShopCard = () => {
    return (
        <Link className="animate-in fade-in shadow" href="/shop/product/SOMEPRODUCT">
            <div className="relative w-full h-56">
                <Image sizes='((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em' className="object-center object-cover" src="https://api.dicebear.com/6.x/icons/png" fill alt="product" />
            </div>
            <div className="p-2">
                <h1 className="font-bold">Title</h1>
                <span className="text-xs text-gray-800">Category</span>
                <div className='w-full flex justify-between mt-4'>
                    <button onClick={(ev) => {
                        ev.preventDefault();
                        console.log("Data")
                    }} className="hover:text-gray-600 text-gray-700">
                        <HiPlusCircle className="h-8 w-8" />
                    </button>
                    <span>$10.00</span>
                </div>
            </div>
        </Link>
    );
}

export default ShopCard;