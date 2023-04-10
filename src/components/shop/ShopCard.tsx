import Link from "next/link";
import Image from "next/image";

interface Props {
  name?: string;
  id?: string;
  price?: string;
  category?: string | null;
  image?: {
    url: string;
    alt: string;
  } | null;
}

const ShopCard: React.FC<Props> = ({
  name = "Title",
  id = "",
  image,
  price,
  category,
}) => {
  return (
    <Link
      data-cy="product-tag"
      className="z-0 shadow animate-in fade-in"
      href={`/shop/product/${id}`}
    >
      <div className="relative h-56 w-full">
        <Image
          className="object-cover object-center"
          src={
            image?.url ?? `https://api.dicebear.com/6.x/icons/png?seed=${name}`
          }
          fill
          alt={image?.alt ?? "product"}
          sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
        />
      </div>
      <div className="p-2">
        <h1 className="font-bold" data-cy="product-name">
          {name}
        </h1>
        <span className="text-xs text-gray-800" data-cy="product-category">
          {category ?? "General"}
        </span>
        <div className="mt-4 flex w-full justify-end">
          <span data-cy="product-price">{price ?? "$??.??"}</span>
        </div>
      </div>
    </Link>
  );
};

export default ShopCard;
