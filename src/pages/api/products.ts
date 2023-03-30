import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";
import { logger } from "@lib/logger";
import { getKeys } from "@lib/dynamic_keys";
import { Shopify } from "@api/gql";
import { PUBLIC_CACHE_FOR_2H } from "@lib/revaildateTimings";
import { handleError } from "@api/errorHandler";

type EncodeProductItem = [Storefront.StorefrontType, string, string];
interface StorefontsProducts {
  keys: string[];
  products: { idx: number; item: string }[];
}

const inputValidation = z
  .string()
  .transform((value) =>
    Buffer.from(value, "base64").toString("utf-8").split(",")
  );

const keyGeneration = (storefront: Storefront.StorefrontType, tenant: string) => {
  switch (storefront) {
    case "S":
      return [`${tenant}_SHOPIFY_ACCESS_TOKEN`, `${tenant}_SHOPIFY_DOMAIN`];
    default:
      return [];
  }
};

const shopifyData = async (arg: StorefontsProducts) => {
  const keys = await getKeys(arg.keys);

  const items = Object.entries(keys);
  const access_token = items.find((value) =>
    value[0].endsWith("_ACCESS_TOKEN")
  );
  const domain = items.find((value) => value[0].endsWith("_SHOPIFY_DOMAIN"));

  if (!domain || !access_token)
    throw new Error(`Failed to get domain or access_tokens`);

  const shopify_query = arg.products
    .map(
      (value) => `
        item_${value.idx}: productByHandle(handle: "${value.item}") {
            featuredImage {
                altText
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
    `
    )
    .join("\n");

  const query = `query GetStoreItems {${shopify_query}}`;

  const data = await Shopify(query, {
    SHOPIFY_DOMAIN: domain[1],
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: access_token[1],
  });

  return Object.entries(data).map(([key, value]) => {
    return {
      index: parseInt(key.split("_")?.at(1) ?? "0"),
      product: value,
    };
  });
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") throw createHttpError.MethodNotAllowed();

    // Query Param
    // FORMAT: storeFront$TENANT$ProductHandle
    const request = inputValidation.parse(req.query?.find);

    const query = new Map<Storefront.StorefrontType, { [key: string]: StorefontsProducts }>();

    // sort data into their storefronts and tenants
    for (const [idx, data] of request.entries()) {
      const [storefront, tenant, product] = data.split(
        "$"
      ) as EncodeProductItem;

      if (!storefront || !tenant || !product) {
        logger.warn({ storefront, tenant, product }, "Ignoring product query");
        continue;
      }

      const tenant_propper = tenant.toUpperCase();

      if (!query.has(storefront)) {
        query.set(storefront, {});
      }

      const stores = query.get(storefront);
      if (!stores) continue;

      if (!stores[tenant_propper]) {
        stores[tenant_propper] = {
          keys: keyGeneration(storefront, tenant_propper),
          products: [],
        };
      }

      stores[tenant_propper]?.products.push({ idx, item: product });
    }

    // generate fetch promies
    const data: Promise<any[]>[] = [];

    for (const [storefront, values] of query.entries()) {
      switch (storefront) {
        case "S":
          for (const tenant of Object.values(values))
            data.push(shopifyData(tenant));
          break;
        default:
          logger.warn({ storefront }, `Using unspported storefront!`);
          continue;
      }
    }

    const results = await Promise.allSettled(data);

    const output: any[] = [];

    for (const item of results) {
      if (item.status === "rejected") continue;
      output.push(...item.value);
    }

    // cache for 2 hours
    if (!req.preview || process.env.VERCEL_ENV !== "development")
      res.setHeader("Cache-Control", PUBLIC_CACHE_FOR_2H);
    return res
      .status(200)
      .json(
        output.sort((a, b) => a.index - b.index).map((value) => value.product)
      );
  } catch (error) {
    return handleError(error, res);
  }
}
