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
export interface FeatureShopItems {
  items: { item: { value: string } }[];
}

//https://shopify.dev/custom-storefronts/tools/graphiql-storefront-api
//https://shopify.dev/api/admin-graphql/2022-10/queries/products#examples-Get_two_specific_products_by_their_ID_using_aliases

const formatter = (range: StoreItem["priceRange"], locale?: string) => {
  const handler = Intl.NumberFormat(locale, {
    style: "currency",
    currency: range.maxVariantPrice.currencyCode,
  });
  if (range.maxVariantPrice.amount === range.minVariantPrice.amount) {
    if (range.maxVariantPrice.amount.startsWith("$"))
      return `${range.maxVariantPrice.currencyCode} ${range.maxVariantPrice.amount}`;
    return handler.format(parseFloat(range.maxVariantPrice.amount));
  }

  return `${handler.format(
    parseFloat(range.minVariantPrice.amount)
  )} - ${handler.format(parseFloat(range.maxVariantPrice.amount))}`;
};

export default function FeaturedShopItems(props: FeatureShopItems) {
  const { data, error, isLoading } = useSWR<StoreItem[], Response, string>(
    `/api/products?find=${btoa(
      props.items.map((value) => value.item.value).join(",")
    )}`,
    (url: string) =>
      fetch(url).then((value) => value.json()) as Promise<StoreItem[]>
  );

  if (!data && isLoading)
    return (
      <section className="flex flex-col bg-zinc-100 py-8 px-4">
        <div className="flex items-center justify-center">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
        </div>
      </section>
    );

  if (!data || error || "message" in data || !data.length) return null;

  return (
    <section className="flex max-h-max flex-col bg-zinc-100">
      <div className="my-4 flex flex-wrap justify-center gap-4 p-4">
        {data.map(
          ({ handle, featuredImage, priceRange, title, onlineStoreUrl }, i) => (
            <Link
              key={handle}
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
                  src={featuredImage.url}
                  alt={featuredImage.altText ?? "Store Item"}
                  sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
                  fill
                />
              </div>
              <div className="py-4 text-center text-sm">
                <span>{title}</span>
                <p className="pt-2">{formatter(priceRange)}</p>
              </div>
            </Link>
          )
        )}
      </div>
    </section>
  );
}
