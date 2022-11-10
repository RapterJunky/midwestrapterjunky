import Image from 'next/image';
import Link from 'next/link';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import Button from "../Button";

interface StoreItem { 
    featuredImage: { 
        altText: string | null; url: string; 
    }; 
    onlineStoreUrl: string;
    title: string;
    handle: string;  
    priceRange: {
        maxVariantPrice: {
          amount: string;
          currencyCode: string;
        }
        minVariantPrice: {
          amount: string;
          currencyCode: string;
        }
    }
}


interface FeatureShopItems {
    items: { [key: string]: StoreItem }
}

//https://shopify.dev/custom-storefronts/tools/graphiql-storefront-api
//https://shopify.dev/api/admin-graphql/2022-10/queries/products#examples-Get_two_specific_products_by_their_ID_using_aliases

const formatter = (locale: string = "en", currency: string, value: string) => Intl.NumberFormat(locale,{ style: "currency", currency }).format(parseFloat(value));

export default function FeaturedShopItems(props: FeatureShopItems){
    return (
        <section className="flex flex-col bg-zinc-100 py-10 px-4">
            <div className='flex flex-wrap'>
                {Object.entries(props.items).map(([key,{ featuredImage, priceRange, title, onlineStoreUrl }])=>(
                    <Link key={key} className="flex flex-col items-center" href={onlineStoreUrl}>
                        <div className="h-96 w-96 relative">
                            <Image className="object-contain object-center"  src={featuredImage.url} alt={featuredImage.altText ?? "Store Item"} fill/>
                        </div>
                        <div className="py-4 text-center">
                            <h4>{title}</h4>
                            <p className="pt-2">{formatter("en",priceRange.maxVariantPrice.currencyCode, priceRange.maxVariantPrice.amount)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}