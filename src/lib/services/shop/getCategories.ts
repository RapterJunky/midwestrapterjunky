import { cache } from "react";
import { Client, type ApiError, type ApiResponse } from "square";
import "server-only";
import { logger } from "@lib/logger";
import { REVAILDATE_IN_2H } from "@lib/revaildateTimings";

type Categories = {
  name: string;
  id: string;
};

export const revalidate = REVAILDATE_IN_2H;

const getCategories = cache(async (): Promise<Categories[]> => {
  const client = new Client({
    accessToken: process.env.SQAURE_ACCESS_TOKEN,
    environment: process.env.SQUARE_MODE,
  });

  const request = await client.catalogApi
    .listCatalog(undefined, "CATEGORY")
    .catch((e: ApiResponse<ApiError>) => e);
  if (!request?.result) return [];

  if ("errors" in request.result) {
    logger.error(request.result, "Square API request error");
    throw request;
  }

  if ("objects" in request.result && request.result.objects) {
    return request.result.objects.map((item) => ({
      name: item.categoryData?.name ?? "Unknown Category",
      id: item.id,
    }));
  }

  return [];
});

export default getCategories;
