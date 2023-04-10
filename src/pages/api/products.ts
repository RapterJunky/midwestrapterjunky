import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { Client, Environment } from "square";
import { z } from "zod";

import { squareToShopifyProduct } from "@lib/plugin/SquareClient";
import { PUBLIC_CACHE_FOR_2H } from "@lib/revaildateTimings";
import { handleError } from "@api/errorHandler";
import { getKeys } from "@lib/dynamic_keys";
import { logger } from "@lib/logger";
import { Shopify } from "@api/gql";

type EncodeProductItem = [Storefront.StorefrontType, string, string];
type Products = {
  index: number;
  product: Storefront.Product;
};
interface StorefontsProducts {
  keys: string[];
  products: { idx: number; item: string }[];
}

const inputValidation = z
  .string()
  .transform((value) =>
    Buffer.from(value, "base64").toString("utf-8").split(",")
  );

const keyGeneration = (
  storefront: Storefront.StorefrontType,
  tenant: string
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

const shopifyData = async (
  arg: StorefontsProducts
): Promise<Array<{ index: number; product: Storefront.Product }>> => {
  const keys = await getKeys(arg.keys);

  const items = Object.entries(keys);
  const access_token = items.find((value) =>
    value.at(0)?.endsWith("_ACCESS_TOKEN")
  );
  const domain = items.find((value) => value[0].endsWith("_SHOPIFY_DOMAIN"));

  if (!domain || !access_token)
    throw new Error(`Failed to get domain or access_tokens`);

  const shopify_query = arg.products
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
    `
    )
    .join("\n");

  const query = `query GetStoreItems {${shopify_query}}`;

  const data = await Shopify<Record<string, Storefront.Product>>(query, {
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

const squareData = async (
  arg: StorefontsProducts
): Promise<Array<{ index: number; product: Storefront.Product }>> => {
  const keys = await getKeys(arg.keys);
  const items = Object.entries(keys);
  const access_token = items.find((value) =>
    value.at(0)?.endsWith("_ACCESS_TOKEN")
  );

  const mode = items.find((value) => value.at(0)?.endsWith("_SQAURE_MODE"));

  if (!access_token || !mode) throw new Error("Failed to get keys");
  if (
    !["connect.squareupsandbox.com", "connect.squareup.com"].includes(mode[1])
  )
    throw new Error("Invaild mode");

  const client = new Client({
    accessToken: access_token[1],
    environment:
      mode[1] === "connect.squareup.com"
        ? Environment.Production
        : Environment.Sandbox,
  });

  const request = await client.catalogApi.batchRetrieveCatalogObjects({
    includeDeletedObjects: false,
    includeRelatedObjects: true,
    objectIds: arg.products.map((value) => value.item),
  });

  if (!request.result?.objects) throw new Error("No items returned!");

  return request.result.objects.map((item, i) => ({
    index: i,
    product: squareToShopifyProduct(item, request.result?.relatedObjects),
  }));
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

    const query = new Map<
      Storefront.StorefrontType,
      { [key: string]: StorefontsProducts }
    >();

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
    const data: Promise<Products[]>[] = [];

    for (const [storefront, values] of query.entries()) {
      switch (storefront) {
        case "S":
          for (const tenant of Object.values(values))
            data.push(shopifyData(tenant));
          break;
        case "SQ":
          for (const tenant of Object.values(values)) {
            data.push(squareData(tenant));
          }
          break;
        default:
          logger.warn({ storefront }, `Using unspported storefront!`);
          continue;
      }
    }

    const results = await Promise.allSettled(data);

    const output: Products[] = [];

    for (const item of results) {
      if (item.status === "rejected") {
        logger.error(item.reason, "Item Rejected");
        continue;
      }
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
