import Link from "next/link";
import Image from "next/image";
import type { SearchQueryResult } from "@/gql/sqaure/searchQuery";

const ShopCard: React.FC<{ item: SearchQueryResult["catalogItems"]["nodes"][0] }> = ({ item }) => {

  const image = item.images?.at(0) ?? {
    name: item.name,
    url: `https://api.dicebear.com/6.x/icons/png?seed=${item.name}`,
    caption: null
  }

  const variation = item.variations.find(value => value.pricingType === "FIXED_PRICING");

  let price = "$??.??";

  if (variation && variation.priceMoney) {
    price = (variation.priceMoney.amount / 100).toLocaleString(undefined, {
      style: "currency",
      currency: variation.priceMoney.currency
    });
  }

  return (
    <Link
      data-cy="product-tag"
      className="z-0 shadow animate-in fade-in"
      href={`/shop/product/${item.id}`}
    >
      <div className="relative h-56 w-full">
        <Image
          className="object-cover object-center"
          src={image.url}
          fill
          alt={image.caption ?? "product"}
          sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
        />
      </div>
      <div className="p-2">
        <h1 className="font-bold" data-cy="product-name">
          {item.name}
        </h1>
        <span className="text-xs text-gray-800" data-cy="product-category">
          {item.category?.name ?? "General"}
        </span>
        <div className="mt-4 flex w-full justify-end">
          <span data-cy="product-price">{price}</span>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
