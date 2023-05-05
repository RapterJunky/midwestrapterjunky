import type { NextApiRequest, NextApiResponse } from "next";
import { type CatalogObject, Client } from "square";
import createHttpError from "http-errors";
import { z } from "zod";

import { handleError } from "@lib/api/errorHandler";

const schema = z.object({
  cursor: z.string().optional(),
  query: z.string().optional(),
  sort: z.enum(["latest", "lth", "htl"]).optional(),
  category: z.string().optional(),
  vender: z.string().optional(),
  ignore: z.string().nonempty().optional(),
  limit: z.coerce
    .number()
    .positive()
    .int()
    .max(15)
    .min(4)
    .optional()
    .default(15),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "GET") throw createHttpError.MethodNotAllowed();

    const { cursor, query, sort, category, limit, ignore } = schema.parse(
      req.query
    );

    const client = new Client({
      accessToken: process.env.SQAURE_ACCESS_TOKEN,
      environment: process.env.SQUARE_MODE,
    });

    const content = await client.catalogApi.searchCatalogObjects({
      includeDeletedObjects: false,
      includeRelatedObjects: true,
      // May return with item that will be ignored
      // so fetch an extra to try to return wanted amount
      limit: ignore ? limit + 1 : limit,
      objectTypes: ["ITEM"],
      cursor,
      query:
        query || category
          ? {
              exactQuery: category
                ? {
                    attributeName: "category_id",
                    attributeValue: category,
                  }
                : undefined,
              textQuery: query
                ? {
                    keywords: query.split(" "),
                  }
                : undefined,
            }
          : undefined,
    });

    let items = [];

    if (!content?.result.objects)
      return res.status(200).json({
        result: [],
        hasNextPage: false,
        nextCursor: null,
      });

    for (const item of content.result.objects) {
      const format = Intl.NumberFormat(undefined, {
        style: "currency",
        currency:
          item.itemData?.variations?.at(0)?.itemVariationData?.priceMoney
            ?.currency ?? "USD",
      });

      let image = null;
      if (item.itemData?.imageIds && content?.result.relatedObjects) {
        const imageId = item.itemData.imageIds.at(0);
        const data = content.result.relatedObjects.find(
          (value) => value.id === imageId
        );
        if (data && data.type === "IMAGE" && data.imageData) {
          image = {
            url: data.imageData.url,
            alt: data.imageData.name,
          };
        }
      }

      let categoryName = null;
      if (item.itemData?.categoryId && content?.result.relatedObjects) {
        const category = content.result.relatedObjects.find(
          (value) => value.id === item.itemData?.categoryId
        );
        if (category && category.type === "CATEGORY") {
          categoryName = category.categoryData?.name;
        }
      }

      const data = {
        name: item.itemData?.name,
        id: item.id,
        image,
        price: format.format(
          (Number(
            item.itemData?.variations?.at(0)?.itemVariationData?.priceMoney
              ?.amount
          ) ?? 0) / 100
        ),
        category: categoryName,
        price_int:
          Number(
            item.itemData?.variations?.at(0)?.itemVariationData?.priceMoney
              ?.amount
          ) ?? 0,
        // `createdAt` is missing in sqaure CatalogObject
        // @see https://github.com/square/square-nodejs-sdk/issues/121
        created_at: (item as CatalogObject & { createdAt: string }).createdAt,
      };
      items.push(data);
    }

    // cursor === current
    //

    switch (sort) {
      case "htl":
        items.sort((a, b) => b.price_int - a.price_int);
        break;
      case "lth":
        items.sort((a, b) => a.price_int - b.price_int);
        break;
      case "latest":
        items.sort((a, b) => {
          const ad = new Date(a.created_at);
          const ac = new Date(b.created_at);
          if (ad > ac) return -1;
          if (ad < ac) return 1;
          return 0;
        });
        break;
      default:
        break;
    }

    if (ignore) {
      items = items.filter((value) => value.id !== ignore).slice(0, limit);
    }

    return res.status(200).json({
      result: items,
      hasNextPage: Boolean(content?.result.cursor),
      nextCursor: content?.result.cursor ?? null,
    });
  } catch (error) {
    return handleError(error, res);
  }
}
