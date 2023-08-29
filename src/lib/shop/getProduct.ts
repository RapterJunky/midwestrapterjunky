import { cache } from "react";
import { Client } from "square";
import "server-only";

import { REVAILDATE_IN_2H } from "../revaildateTimings";
import { logger } from "../logger";

const DEFAULT_PRODUCT_DESCRIPTION = "No product description";

export const revalidate = REVAILDATE_IN_2H;

const getProduct = cache(async (productId: string) => {
    const client = new Client({
        accessToken: process.env.SQAURE_ACCESS_TOKEN,
        environment: process.env.SQUARE_MODE,
    });

    const request = await client.catalogApi.retrieveCatalogObject(productId, true);

    if ("errors" in request.result) {
        logger.error(request.result.errors);
        return null;
    }

    if (!request.result.object || request.result.object.isDeleted) return null;

    const { object: { itemData, customAttributeValues, updatedAt, id }, relatedObjects } = request.result;

    let category: { name: string; id: string; } | null = null;
    if (itemData?.categoryId && relatedObjects) {
        const item = relatedObjects.find(
            (value) => value.id == itemData.categoryId,
        );
        if (item && item.categoryData && item.categoryData.name) {
            category = {
                name: item.categoryData.name,
                id: item.id,
            };
        }
    }

    let images: { alt: string; url: string }[] = [];
    if (itemData?.imageIds && relatedObjects) {
        images = itemData.imageIds
            .map((image) => {
                const data = relatedObjects.find((item) => item.id === image);
                if (!data || !data?.imageData) return null;
                return {
                    url: data.imageData.url as string,
                    alt: data.imageData.caption ?? data.imageData.name ?? "Product",
                };
            })
            .filter(Boolean);
    }

    if (!images.length) {
        images = [
            {
                url: `https://api.dicebear.com/6.x/icons/png?seed=${itemData?.name ?? "PH"
                    }`,
                alt: "Product Image",
            },
        ];
    }

    const variations = [];
    if (itemData?.variations) {
        for (const variation of itemData?.variations) {
            if (!variation.itemVariationData) continue;
            const { itemVariationData } = variation;

            if (variation.isDeleted || !itemVariationData.sellable) continue;

            let price = 999999;
            let currency = "USD";
            if (!itemVariationData?.priceMoney) {
                const first = itemData.variations?.at(0)?.itemVariationData?.priceMoney;
                if (first) {
                    price = Number(first.amount);
                    currency = first.currency ?? "USD";
                }
            } else {
                currency = itemVariationData.priceMoney.currency ?? "USD";
                price = Number(itemVariationData?.priceMoney?.amount);
            }

            variations.push({
                id: variation.id,
                name: itemVariationData?.name ?? null,
                sku: itemVariationData?.sku ?? null,
                ordinal: itemVariationData?.ordinal ?? 0,
                price,
                pricingType: itemVariationData?.pricingType ?? "VARIABLE_PRICING",
                currency,
                itemOptionValues: itemVariationData?.itemOptionValues ?? null,
            });
        }
    }

    const merchent = Object.values(customAttributeValues ?? {}).find(
        (value) => value.name === "Vendor" && value.type === "STRING",
    );

    return {
        id,
        merchent: merchent?.stringValue ?? null,
        images,
        updatedAt,
        customAttributeValues: customAttributeValues ?? null,
        name: itemData?.name ?? "Product",
        description: itemData?.description ?? DEFAULT_PRODUCT_DESCRIPTION,
        labelColor: itemData?.labelColor ?? "ffffff",
        category,
        variations,
    }
});

export default getProduct;