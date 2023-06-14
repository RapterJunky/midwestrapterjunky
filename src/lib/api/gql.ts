import { logger } from "@lib/logger";

type GraphQLClientOptions = {
  method?: "POST" | "GET" | "PATCH" | "DELETE" | "PUT";
  next?: NextFetchRequestConfig;
  headers?: HeadersInit;
  draft?: boolean;
};

type GraphQLClientQuery = {
  url: string;
  query: string;
  variables?: Record<string, unknown>;
};

type Query = {
  query: string;
  variables?: Record<string, unknown>;
};

const getQueryName = (query: string) =>
  query.match(/query\s(?<name>\w+)[\s|\(]/)?.groups?.name;

export async function DatoCMS<T extends object>(
  { query, variables }: Query,
  opts?: GraphQLClientOptions
): Promise<T> {
  logger.debug(
    {
      query: getQueryName(query),
      variables,
      preview: opts?.draft,
      environment: process.env.DATOCMS_ENVIRONMENT,
    },
    "DATOCMS CALL"
  );
  return GQLFetch<T>(
    {
      url: `https://graphql.datocms.com/environments/${process.env.DATOCMS_ENVIRONMENT
        }${opts?.draft ? "/preview" : ""}`,
      query,
      variables,
    },
    {
      ...opts,
      headers: {
        ...opts?.headers,
        Authorization: `Bearer ${process.env.DATOCMS_READONLY_TOKEN}`,
      },
    }
  );
}
export async function Shopify<T extends object>(
  query: string,
  args: { SHOPIFY_STOREFRONT_ACCESS_TOKEN: string; SHOPIFY_DOMAIN: string },
  opts?: GraphQLClientOptions
): Promise<T> {
  return GQLFetch<T>(
    {
      url: `https://${args.SHOPIFY_DOMAIN}.myshopify.com/api/graphql`,
      query,
    },
    {
      ...opts,
      headers: {
        ...opts?.headers,
        "X-Shopify-Storefront-Access-Token":
          args.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
    }
  );
}

async function GQLFetch<T extends object>(
  { url, query, variables = {} }: GraphQLClientQuery,
  { method = "POST", next, headers }: GraphQLClientOptions
): Promise<T> {
  try {
    const responce = await fetch(url, {
      method,
      headers,
      next,
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!responce.ok) throw responce;

    const body = (await responce.json()) as { data: T };

    if ("errors" in body) throw body;

    return body.data;
  } catch (error) {
    logger.error(error, "GraphQL");
    throw new Error("GraphQL Error");
  }
}
