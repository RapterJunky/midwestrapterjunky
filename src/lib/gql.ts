import { GraphQLClient, type Variables } from "graphql-request";
import type { PatchedRequestInit } from "graphql-request/dist/types";
import { logger } from "./logger";

const DATO_CMS = `https://graphql.datocms.com/environments/${
  process.env.DATOCMS_ENVIRONMENT ?? "main"
}`;

interface FetchOptions {
  variables?: Variables;
  preview?: boolean;
}

export async function DATOCMS_Fetch<T extends Object>(
  query: string,
  opts?: FetchOptions
): Promise<T> {
  logger.debug(
    {
      preview: opts?.preview,
      env: process.env.DATOCMS_ENVIRONMENT,
    },
    "DATOCMS CALL"
  );
  return GQLFetch<T>(
    `${DATO_CMS}${opts?.preview ? "/preview" : ""}`,
    query,
    opts,
    {
      headers: {
        Authorization: `Bearer ${process.env.DATOCMS_READONLY_TOKEN}`,
      },
    }
  );
}
export async function Shopify_Fetch<T extends Object>(
  query: string,
  args: { SHOPIFY_STOREFRONT_ACCESS_TOKEN: string; SHOPIFY_DOMAIN: string },
  opts?: FetchOptions
): Promise<T> {
  return GQLFetch<T>(
    `https://${args.SHOPIFY_DOMAIN}.myshopify.com/api/graphql`,
    query,
    opts,
    {
      headers: {
        "X-Shopify-Storefront-Access-Token":
          args.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
    }
  );
}

async function GQLFetch<T extends Object>(
  url: string,
  query: string,
  { variables }: FetchOptions = {},
  opts?: PatchedRequestInit
): Promise<T> {
  try {
    const client = new GraphQLClient(url, opts);

    const request = await client.rawRequest(query, variables);

    if (request?.errors) throw request.errors;

    return request.data;
  } catch (error: any) {
    if ("response" in error) {
      logger.error(
        {
          errors: error?.response.errors,
          url: url,
        },
        "GraphQL Error"
      );
      throw new Error("GraphQL Error");
    }

    throw new Error(JSON.stringify(error, undefined, 2));
  }
}
