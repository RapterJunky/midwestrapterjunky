import createHttpError from "http-errors";
import type { Client, Money } from "square";

type PricedItem = {
  pricingType: string;
  catalogObjectId: string;
  quantity: string;
};
type SquarePricedItem = Omit<
  PricedItem & { basePriceMoney?: Money },
  "pricingType"
>;

const getPricingForVarable = async (
  client: Client,
  items: PricedItem[],
): Promise<Array<SquarePricedItem>> => {
  if (items.some((value) => value.pricingType === "VARIABLE_PRICING")) {
    const objectIds = items
      .filter((value) => value.pricingType === "VARIABLE_PRICING")
      .map((value) => value.catalogObjectId);

    const catalogItems = await client.catalogApi.batchRetrieveCatalogObjects({
      includeDeletedObjects: false,
      includeRelatedObjects: true,
      objectIds,
    });

    const { objects, relatedObjects } = catalogItems.result;

    if (!objects || !relatedObjects)
      throw createHttpError.InternalServerError(
        "Failed to get variable item pricing.",
      );

    for (const item of objects) {
      const root = items.find((value) => value.catalogObjectId === item.id);
      if (!root) throw createHttpError.InternalServerError();

      // make sure that this item is what it says it is.
      if (item.itemVariationData?.pricingType !== root.pricingType)
        throw createHttpError.BadRequest(
          `Item ${root.catalogObjectId} does not match server catalog pricing type.`,
        );

      const parentId = item.itemVariationData?.itemId;
      const parent = relatedObjects.find((value) => value.id === parentId);
      if (!parent)
        throw createHttpError.InternalServerError(
          "Variable priced item does not have a parent.",
        );

      const firstWithfixed = parent.itemData?.variations?.find(
        (value) => value.itemVariationData?.pricingType === "FIXED_PRICING",
      );
      if (!firstWithfixed || !firstWithfixed.itemVariationData?.priceMoney)
        throw createHttpError.InternalServerError(
          "Failed to find fixed price for variable product.",
        );

      const idx = items.findIndex((value) => value.catalogObjectId === item.id);
      if (idx === -1)
        throw createHttpError.InternalServerError(
          "Failed to update variable priced item.",
        );
      (items[idx] as SquarePricedItem).basePriceMoney =
        firstWithfixed.itemVariationData?.priceMoney;
    }
  }

  return items.map((value) => ({
    quantity: value.quantity,
    catalogObjectId: value.catalogObjectId,
    basePriceMoney: (value as SquarePricedItem)?.basePriceMoney,
  }));
};

export default getPricingForVarable;
