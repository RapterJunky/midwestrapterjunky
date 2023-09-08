import { cache } from "react";
import "server-only";
import { logger } from "@lib/logger";

const getQueryName = (query: string) =>
  query.match(/query\s(?<name>\w+)[\s|\(]/)?.groups?.name;

const dedupedFetch = cache(async (requestData: string) => {
  const request = JSON.parse(requestData) as RequestInit;

  const parsedBody = JSON.parse(request.body as string) as { query: string; variables?: Record<string, string> };

  logger.debug(
    {
      query: getQueryName(parsedBody.query),
      mode: process.env.SQUARE_MODE,
      vars: parsedBody?.variables,
    },
    "SquareAPI request",
  );

  const url =
    process.env.VERCEL_ENV === "production"
      ? "https://connect.squareup.com/public/graphql"
      : "https://connect.squareupsandbox.com/public/graphql";

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
        body: parsedBody,
        errors: responseBody.errors,
        mode: process.env.SQUARE_MODE,
      },
      "Failed square query",
    );
    throw new Error(`${response.status} ${response.statusText}`,);
  }
  return responseBody;
});

type QueryOptions = {
  variables?: Record<string, unknown>;
  revalidate?: RequestInit["next"];
};

export default async function getSquareQuery<T>(
  query: string,
  opts?: QueryOptions,
) {
  const { data } = await dedupedFetch(
    JSON.stringify({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SQAURE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({ query, variables: opts?.variables }),
      next: opts?.revalidate,
    }),
  );

  return data as T;
}
