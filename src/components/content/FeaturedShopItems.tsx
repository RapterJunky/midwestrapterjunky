import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

export interface StoreItem {
  featuredImage: {
    altText: string | null;
    url: string;
  };
  onlineStoreUrl: string;
  title: string;
  handle: string;
  priceRange: {
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}
interface FeatureShopItems {
  items: { item: { value: string } }[];
}

//https://shopify.dev/custom-storefronts/tools/graphiql-storefront-api
//https://shopify.dev/api/admin-graphql/2022-10/queries/products#examples-Get_two_specific_products_by_their_ID_using_aliases

const formatter = (locale: string = "en", currency: string, value: string) =>
  Intl.NumberFormat(locale, { style: "currency", currency }).format(
    parseFloat(value)
  );

export default function FeaturedShopItems(props: FeatureShopItems) {
  const { data, error } = useSWR<StoreItem[]>(
    [
      `/api/products?find=${btoa(
        props.items.map((value) => value.item.value).join(",")
      )}`,
    ],
    (url: string) => fetch(url).then((value) => value.json())
  );

  if (!data)
    return (
      <section className="flex flex-col bg-zinc-100 py-8 px-4">
        <div className="flex items-center justify-center">
          <div
            className="spinner-border inline-block h-8 w-8 animate-spin rounded-full border-4"
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </section>
    );

  if (error || "message" in data) return null;

  return (
    <section className="flex flex-col bg-zinc-100 py-8 px-4">
      <div className="flex flex-wrap justify-center">
        {data.map(
          ({ handle, featuredImage, priceRange, title, onlineStoreUrl }) => (
            <Link
              key={handle}
              className="mb-11 flex flex-col items-center gap-2"
              href={onlineStoreUrl}
            >
              <div className="relative h-48 w-48 sm:h-60 sm:w-60 md:h-72 md:w-72 lg:h-96 lg:w-96">
                <Image
                  className="h-full w-full object-contain object-center"
                  src={featuredImage.url}
                  alt={featuredImage.altText ?? "Store Item"}
                  sizes="100vw"
                  fill
                />
              </div>
              <div className="py-4 text-center text-sm">
                <span>{title}</span>
                <p className="pt-2">
                  {formatter(
                    "en",
                    priceRange.maxVariantPrice.currencyCode,
                    priceRange.maxVariantPrice.amount
                  )}
                </p>
              </div>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
