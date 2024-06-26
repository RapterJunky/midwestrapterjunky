import Image from "next/image";
import Link from "next/link";
import getFeaturedItems from "@/lib/services/store/getFeaturedItems";
import type { ModulerContent } from "@/types/page";

export interface FeatureShopItemsProps extends ModulerContent {
  items: { id: string; item: { value: string } | null }[];
}

//https://shopify.dev/custom-storefronts/tools/graphiql-storefront-api
//https://shopify.dev/api/admin-graphql/2022-10/queries/products#examples-Get_two_specific_products_by_their_ID_using_aliases

const formatter = (
  range: Storefront.Product["priceRange"],
  locale?: string,
) => {
  const maxPrice = range.maxVariantPrice.amount;
  const minPrice = range.minVariantPrice.amount;
  const code = range.maxVariantPrice.currencyCode;
  if (typeof maxPrice === "string" || typeof minPrice === "string") {
    if (maxPrice === minPrice) return `${code} ${maxPrice}`;
    return `${code} ${minPrice} - ${code} ${maxPrice}`;
  }
  const handler = Intl.NumberFormat(locale, {
    style: "currency",
    currency: code,
  });
  if (maxPrice === minPrice) {
    return handler.format(maxPrice);
  }
  return `${handler.format(minPrice)} - ${handler.format(maxPrice)}`;
};

const FeaturedShopItems: React.FC<FeatureShopItemsProps> = async (props) => {
  const data = await getFeaturedItems(props.items);

  if (!data.length) return null;

  return (
    <section className="flex max-h-max flex-col bg-zinc-100">
      <div className="my-4 flex flex-wrap justify-center gap-4 p-4">
        {data.map(({ handle, image, priceRange, title, onlineStoreUrl }, i) => (
          <Link
            key={`${i}-${handle}`}
            className={`flex flex-col items-center gap-2 p-4 animate-in fade-in-0 fill-mode-forwards hover:shadow hover:outline hover:outline-1 hover:outline-gray-300 ${[
              "delay-75",
              "delay-150",
              "delay-300",
              "delay-500",
            ].at(i)}`}
            href={onlineStoreUrl}
          >
            <div className="relative h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 lg:h-96 lg:w-96">
              <Image
                className="object-contain object-center"
                src={image.url}
                alt={image.alt ?? "Featured Product"}
                sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
                fill
              />
            </div>
            <div className="py-4 text-center text-sm">
              <span>{title}</span>
              <p className="pt-2">{formatter(priceRange)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default FeaturedShopItems;
