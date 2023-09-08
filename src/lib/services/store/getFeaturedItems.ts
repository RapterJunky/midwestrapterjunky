import "server-only";

import FeaturedQuery, {
  type FeaturedQueryResult,
} from "@/gql/sqaure/featuredQuery";
import getShopifyQuery from "@/lib/services/store/getShopifyQuery";
import getSquareQuery from "@/lib/services/shop/GetSquareQuery";
import getPlaceholderImage from "@utils/getPlaceholderImage";
import { REVAILDATE_IN_2H } from "@lib/revaildateTimings";
import { getKeys } from "@lib/dynamic_keys";
import { logger } from "@lib/logger";
import { cache } from "react";

type Products = {
  index: number;
  product: Storefront.Product;
};
type EncodeProductItem = [Storefront.StorefrontType, string, string];
type StorefontsProducts = {
  keys: string[];
  products: { idx: number; item: string }[];
};

export const revalidate = REVAILDATE_IN_2H;

const fetchShopify = async (data: StorefontsProducts): Promise<Products[]> => {
  const keys = await getKeys(data.keys);

  const items = Object.entries(keys);
  const access_token = items.find(
    (value) => value.at(0)?.endsWith("_ACCESS_TOKEN"),
  );
  const domain = items.find((value) => value[0].endsWith("_SHOPIFY_DOMAIN"));

  if (!domain || !access_token)
    throw new Error(`Failed to get domain or access_tokens`);

  const shopify_query = data.products
    .map(
      (value) => `
        item_${value.idx}: productByHandle(handle: "${value.item}") {
            image: featuredImage {
              alt: altText
              url
            }
            title
            handle
            onlineStoreUrl
            priceRange {
            maxVariantPrice {
                amount
                currencyCode
            }
            minVariantPrice {
                amount
                currencyCode
                }
            }
        }
    `,
    )
    .join("\n");
  const query = `query GetStoreItems {${shopify_query}}`;

  const content = await getShopifyQuery<{
    [key: `item_${number}`]: Storefront.Product;
  }>(query, {
    args: {
      SHOPIFY_DOMAIN: domain[1],
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: access_token[1],
    },
  });

  return Object.entries(content).map(([key, value]) => {
    return {
      index: parseInt(key.split("_")?.at(1) ?? "0"),
      product: value,
    } as Products;
  });
};

const fetchSquare = async (data: StorefontsProducts): Promise<Products[]> => {
  const { catalog } = await getSquareQuery<FeaturedQueryResult>(FeaturedQuery, {
    variables: {
      merchantId: process.env.SQAURE_MERCHANT_ID,
      items: data.products.map((value) => value.item),
    },
  });

  return catalog.nodes.map((value, i) => {
    const price = value.variations.find(
      (value) => value.pricingType === "FIXED_PRICING",
    );

    const amount = (
      (price?.priceMoney?.amount ?? 9999999) / 100
    ).toLocaleString(undefined, {
      style: "currency",
      currency: price?.priceMoney?.currency,
    });

    return {
      index: data.products[i]?.idx ?? 0,
      product: {
        title: value.title,
        onlineStoreUrl: `${process.env.VERCEL_ENV === "development" ? "http" : "https"
          }://${process.env.VERCEL_URL}/shop/product/${value.id}`,
        image: value.images?.at(0) ?? {
          url: getPlaceholderImage(value.title),
          alt: value.title,
        },
        priceRange: {
          maxVariantPrice: {
            amount,
            currencyCode: price?.priceMoney?.currency,
          },
          minVariantPrice: {
            amount,
            currencyCode: price?.priceMoney?.currency,
          },
        },
      },
    } as Products;
  });
};

const keyGeneration = (
  storefront: Storefront.StorefrontType,
  tenant: string,
) => {
  switch (storefront) {
    case "S":
      return [`${tenant}_SHOPIFY_ACCESS_TOKEN`, `${tenant}_SHOPIFY_DOMAIN`];
    case "SQ":
      return [`${tenant}_SQAURE_ACCESS_TOKEN`, `${tenant}_SQAURE_MODE`];
    default:
      return [];
  }
};

const getFeaturedItems = cache(
  async (items: string[]): Promise<Storefront.Product[]> => {
    const query = new Map<Storefront.StorefrontType, StorefontsProducts>();

    // sort data into their storefronts and tenants
    for (const [idx, item] of items.entries()) {
      const [storefront, tenant, product] = item.split(
        "$",
      ) as EncodeProductItem;

      if (!storefront || !tenant || !product) {
        logger.warn({ storefront, tenant, product }, "Ignoring product query");
        continue;
      }

      const tenantId = tenant.toUpperCase();

      if (!query.has(storefront)) {
        query.set(storefront, {
          keys: keyGeneration(storefront, tenantId),
          products: [],
        });
      }

      const stores = query.get(storefront);
      if (!stores) continue;

      stores?.products.push({ idx, item: product });
    }

    // generate fetch promies
    const queries: Promise<Products[]>[] = [];

    for (const [key, data] of query.entries()) {
      switch (key) {
        case "S": {
          queries.push(fetchShopify(data));
          break;
        }
        case "SQ": {
          queries.push(fetchSquare(data));
          break;
        }
        default:
          logger.warn({ storefront: key }, `Using unspported storefront!`);
          continue;
      }
    }

    const results = await Promise.allSettled(queries);

    const contents: Products[] = [];

    for (const item of results) {
      if (item.status === "rejected") {
        logger.error(item.reason, "Item Rejected");
        continue;
      }
      contents.push(...item.value);
    }

    contents.sort((a, b) => a.index - b.index);

    return contents.map((value) => value.product);
  },
);

export default getFeaturedItems;
