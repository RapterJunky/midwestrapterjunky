import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";

import { logger } from "@lib/logger";

type QueryOptions = {
  variables?: Record<string, unknown>;
  includeDrafts?: boolean;
  excludeInvalid?: boolean;
  visualEditingBaseUrl?: string;
  revalidate?: NextFetchRequestConfig | undefined;
};
const getQueryName = (query: string) =>
  query.match(/query\s(?<name>\w+)[\s|\(]/)?.groups?.name;

const dedupedFetch = cache(async (requestData: string) => {
  const request = JSON.parse(requestData) as RequestInit;
  logger.debug(
    {
      draft:
        (request.headers as Record<string, string>)["X-Include-Drafts"] ??
        "false",
      env: process.env.NEXT_DATOCMS_ENVIRONMENT,
      query: getQueryName(
        (JSON.parse((request.body as string) ?? "") as { query: string }).query,
      ),
    },
    "Datocms Query",
  );
  const response = await fetch("https://graphql.datocms.com/", request);
  const responseBody = (await response.json()) as { data: unknown, errors?: { message: string; }[] };
  if (!response.ok) {
    logger.error(
      {
        status: response.status,
        statusText: response.statusText,
        env: process.env.NEXT_DATOCMS_ENVIRONMENT,
      },
      "Failed datocms query",
    );
    throw new Error(`${response.status} ${response.statusText}`);
  }

  if ("errors" in responseBody) {
    logger.error(responseBody.errors, responseBody.errors?.at(0)?.message ?? "Unknown query error.");
    throw new Error(responseBody.errors?.at(0)?.message ?? "Unknown query error.");
  }

  return responseBody;
});

const getPageQuery = async <T>(
  query: string,
  opts?: QueryOptions,
): Promise<T> => {
  const { isEnabled } = draftMode();

  const { data } = await dedupedFetch(
    JSON.stringify({
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.DATOCMS_READONLY_TOKEN}`,
        "X-Environment": process.env.DATOCMS_ENVIRONMENT,
        "X-Include-Drafts":
          isEnabled || opts?.includeDrafts ? "true" : undefined,
        "X-Exclude-Invalid": opts?.excludeInvalid ? "true" : undefined,
        "X-Visual-Editing": opts?.visualEditingBaseUrl
          ? "vercel-v1"
          : undefined,
        "X-Base-Editing-Url": opts?.visualEditingBaseUrl,
      },
      body: JSON.stringify({ query, variables: opts?.variables }),
      next: opts?.revalidate,
    }),
  );

  return data as T;
};

export default getPageQuery;
