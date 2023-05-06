import { GraphQLClient, type Variables, ClientError } from "graphql-request";
import type { RequestConfig } from "graphql-request/src/types";
import { logger } from "@lib/logger";

const DATO_CMS = `https://graphql.datocms.com/environments/${process.env.DATOCMS_ENVIRONMENT ?? "main"
  }`;

interface FetchOptions {
  variables?: Variables;
  preview?: boolean;
}

export async function DatoCMS<T extends object>(
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
export async function Shopify<T extends object>(
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

async function GQLFetch<T extends object>(
  url: string,
  query: string,
  { variables }: FetchOptions = {},
  opts?: RequestConfig
): Promise<T> {
  try {
    const client = new GraphQLClient(url, { ...opts, fetch });

    const request = await client.rawRequest<T>(query, variables);

    if (request?.errors) throw request.errors;

    return request.data;
  } catch (error) {
    if (error instanceof ClientError) {
      logger.error(
        {
          message: error.message,
          errors: error.response.errors,
          url: url,
        },
        "GraphQL Error"
      );
      throw new Error("GraphQL Error");
    }

    throw new Error(JSON.stringify(error, undefined, 2));
  }
}
