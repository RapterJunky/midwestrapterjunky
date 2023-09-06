import "server-only";
import { cache } from "react";
import { logger } from "@lib/logger";

const SHOPIFY_STOREFRONT_API_VERSION = "2023-07";
const getQueryName = (query: string) =>
  query.match(/query\s(?<name>\w+)[\s|\(]/)?.groups?.name;

const dedupedFetch = cache(async (requestData: string) => {
  const { request, url } = JSON.parse(requestData) as {
    url: string;
    request: RequestInit;
  };

  const response = await fetch(url, request);
  const responseBody = (await response.json()) as {
    data: unknown;
    errors?: { code: string; message: string; path: string[] }[];
  };
  const isError = "errors" in responseBody;

  if (!response.ok || isError) {
    logger.error(
      {
        status: response.status,
        statusText: response.statusText,
        url,
        errors: responseBody.errors,
      },
      "Failed shopify query",
    );
    throw new Error(
      `${response.status} ${response.statusText}: ${JSON.stringify(
        responseBody,
      )}`,
    );
  }
  return responseBody;
});

type QueryOptions = {
  args: {
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: string;
    SHOPIFY_DOMAIN: string;
  };
  variables?: Record<string, unknown>;
  revalidate?: RequestInit["next"];
};

export default async function getShopifyQuery<T>(
  query: string,
  opts: QueryOptions,
) {
  logger.debug(
    {
      query: getQueryName(query),
      vars: opts?.variables,
    },
    "Shopify request",
  );

  const { data } = await dedupedFetch(
    JSON.stringify({
      url: `https://${opts.args.SHOPIFY_DOMAIN}.myshopify.com/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql`,
      request: {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token":
            opts.args.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        },
        body: JSON.stringify({ query, variables: opts?.variables }),
        next: opts?.revalidate,
      },
    }),
  );

  return data as T;
}
