import SearchQuery, { type SearchQueryResult } from "@/gql/sqaure/searchQuery";
import getSquareQuery from "@/lib/cache/GetSquareQuery";
import Link from "next/link";
import Image from 'next/image';

const RelatedProducts: React.FC<{ id: string, category?: string }> = async ({ id, category }) => {

    const { catalogItems } = await getSquareQuery<SearchQueryResult>(SearchQuery, {
        variables: {
            merchantId: process.env.SQAURE_MERCHANT_ID,
            limit: 5,
            category: category ? [category] : undefined
        }
    });

    const self = catalogItems.nodes.findIndex(value => value.id === id);

    if (self !== -1) catalogItems.nodes.splice(self, 1);

    const products = catalogItems.nodes.slice(0, 3);

    return (
        <>
            {products.map((item) => {

                const image = item.images?.at(0);

                const data = item.variations.find(value => value.pricingType === "FIXED_PRICING");

                const price = ((data?.priceMoney?.amount ?? 0) / 100).toLocaleString(undefined, {
                    style: "currency",
                    currency: data?.priceMoney?.currency ?? "USD"
                }) ?? "$??.??";

                return (
                    <div
                        className="border border-zinc-200 bg-zinc-100 shadow-lg"
                        key={item.id}
                    >
                        <Link
                            href={`/shop/product/${item.id}`}
                            aria-label={item.name}
                            className="relative box-border inline-block h-full max-h-full w-full cursor-pointer overflow-hidden bg-zinc-100 transition-transform animate-in fade-in"
                        >
                            <div className="flex h-full w-full items-center justify-center overflow-hidden">
                                <Image
                                    className="h-full w-full object-cover"
                                    src={image?.url ?? `https://api.dicebear.com/6.x/icons/png?seed=${item.name}`}
                                    alt={image?.caption ?? "Product Image"}
                                    height={540}
                                    width={540}
                                    sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
                                />
                            </div>
                        </Link>
                        <div className="flex w-full justify-between">
                            <span className="line-clamp-1">{item.name}</span>
                            <span>{price}</span>
                        </div>
                    </div>
                )
            })}
        </>
    );
}

export default RelatedProducts;