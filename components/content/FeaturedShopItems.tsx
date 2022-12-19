import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import type { ShopType } from '../../lib/hooks/plugins/useStore';

export interface StoreItem { 
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
    items: { item: { type: ShopType, handle: string; } }[]
}

//https://shopify.dev/custom-storefronts/tools/graphiql-storefront-api
//https://shopify.dev/api/admin-graphql/2022-10/queries/products#examples-Get_two_specific_products_by_their_ID_using_aliases

const formatter = (locale: string = "en", currency: string, value: string) => Intl.NumberFormat(locale,{ style: "currency", currency }).format(parseFloat(value));

export default function FeaturedShopItems(props: FeatureShopItems){
    const { data, error } = useSWR<StoreItem[]>([`/api/products?find=${btoa(props.items.map(value=>`${value.item.type[0]}:${value.item.handle}`).join(","))}`],(url)=>fetch(url).then(value=>value.json()));

    if(!data) return (
        <section className="flex flex-col bg-zinc-100 py-8 px-4">
            <div className="flex justify-center items-center">
                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </section>
    );

    if(error || "message" in data) return null;

    return (
        <section className="flex flex-col bg-zinc-100 py-8 px-4">
            <div className='flex flex-wrap justify-center'>
                {data.map(({ handle, featuredImage, priceRange, title, onlineStoreUrl })=>(
                    <Link key={handle} className="flex flex-col items-center gap-2 mb-11" href={onlineStoreUrl}>
                        <div className="h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 lg:h-96 lg:w-96 relative">
                            <Image className="object-contain object-center" src={featuredImage.url} alt={featuredImage.altText ?? "Store Item"} sizes="100vw" fill/>
                        </div>
                        <div className="py-4 text-center text-sm">
                            <h4>{title}</h4>
                            <p className="pt-2">{formatter("en",priceRange.maxVariantPrice.currencyCode, priceRange.maxVariantPrice.amount)}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}