import { AuthFetch } from "../utils/plugin/auth_fetch";
import { APIError, type Product } from "./ShopifyClient";

type SquareObject = {
    id: string;
    item_data: {
        image_ids?: string[],
        name: string;
        description: string;
        category_id?: string;
        variations: {
            item_variation_data: {
                sku: string;
                price_money: {
                    amount: number;
                    currency: string;
                }
            }
        }[]
    }
};

type SquareRelatedObjects = Array<{
    type: "IMAGE"
    id: string;
    image_data: {
        url: string;
    }
} | { type: "CATEGORY", id: string; category_data: { name: string; } }>

type SquareCatalogObjects = {
    objects: SquareObject[];
    related_objects?: SquareRelatedObjects;
}

type SquareRetrieveCatalogObject = {
    object: SquareObject;
    related_objects?: SquareRelatedObjects;
}


class SquareClient {
    constructor(private merchant_id: string, private token: string, private is_dev: boolean = false) { }
    async productsMatching(search: string) {
        const data = await this.fetch("list", { search }) as SquareCatalogObjects;
        if (!data?.objects) return [];
        return data.objects.map(item => this.asShopify(item, data.related_objects));
    }

    private asShopify(node: SquareObject, related?: SquareRelatedObjects): Product {
        let productType = "";
        let image: string | undefined;
        let amount = "$??";
        if (related && node.item_data?.category_id) {
            const pt = related.find(value => value.id === node.item_data?.category_id);
            if (pt?.type === "CATEGORY") {
                productType = pt.category_data.name;
            }
        }

        if (related && node.item_data?.image_ids) {
            const url = related.find(value => value.id === node.item_data.image_ids?.at(0));
            if (url?.type === "IMAGE") {
                image = url.image_data.url;
            }
        }
        const price = node.item_data.variations.at(0)?.item_variation_data.price_money;
        if (price) {
            const formatter = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: price.currency,
            });
            amount = formatter.format(price.amount / 100);
        }

        return {
            handle: node.id,
            title: node.item_data.name,
            description: node.item_data.description,
            productType,
            imageUrl: image ?? `https://api.dicebear.com/6.x/initials/png?seed=${encodeURIComponent(node.item_data.name)}`,
            onlineStoreUrl: "https://admin.midwestraptorjunkies.com",
            priceRange: {
                maxVariantPrice: {
                    amount,
                    currencyCode: price?.currency ?? "USD"
                },
                minVariantPrice: {
                    amount,
                    currencyCode: price?.currency ?? "USD"
                }
            },
            images: { edges: [{ node: { src: "" } }] }
        }
    }

    async productByHandle(handle: string) {
        const data = await this.fetch("item", { id: handle }) as SquareRetrieveCatalogObject;
        if (!data.object) return null;
        return this.asShopify(data.object, data.related_objects);
    }

    async fetch(mode: "list" | "item", data: Record<string, unknown>) {
        const response = await AuthFetch(`/api/plugin/square?mode=${mode}`, {
            method: "POST",
            json: {
                ...data,
                sandbox: this.is_dev,
                token: this.token
            }
        });
        if (response.status !== 200) {
            throw new APIError(`Invalid status code: ${response.status}`, {
                cause: "FAILED_NETWORK_REQUEST",
            });
        }

        const contentType = response.headers.get("content-type");

        if (!contentType || !contentType.includes("application/json")) {
            throw new APIError(`Invalid content type: ${contentType}`, {
                cause: "INVAILD_PRODUCT_CONTENT",
            });
        }

        const body = await response.json();

        if ("errors" in body) {
            throw new APIError(body?.message ?? "Failed Square API request.", {
                cause: response.statusText ?? "SQUARE_API_ERROR",
            });
        }

        return body;
    }
}

export default SquareClient;