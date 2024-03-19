import { AuthFetch } from "../utils/plugin/auth_fetch";
import { APIError } from "./ShopifyClient";
import type {
  ApiResponse,
  CatalogObject,
  RetrieveCatalogObjectResponse,
  SearchCatalogObjectsResponse,
} from "square";
import getPlaceholderImage from "@lib/utils/getPlaceholderImage";

export const squareToShopifyProduct = (
  product: CatalogObject,
  related?: CatalogObject[],
): Storefront.Product => {
  let productType = "";
  let image: string | undefined;
  let amount = "$??";
  let imageAlt: string | undefined;

  if (related && product.itemData?.categoryId) {
    const category = related.find(
      (item) => item.id === product.itemData?.categoryId,
    );
    if (category?.type === "CATEGORY" && category.categoryData?.name) {
      productType = category.categoryData.name;
    }
  }

  if (related && product.itemData?.imageIds?.length) {
    const data = related.find(
      (item) => item.id === product.itemData?.imageIds?.at(0),
    );
    if (data?.type === "IMAGE" && data.imageData?.url) {
      image = data.imageData.url;
      imageAlt = data.imageData?.caption ?? data.imageData?.name ?? undefined;
    }
  }

  const priceMoney =
    product.itemData?.variations?.at(0)?.itemVariationData?.priceMoney;
  const priceCode =
    product.itemData?.variations?.at(0)?.itemVariationData?.priceMoney
      ?.currency ?? "USD";
  if (priceMoney) {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: priceCode,
    });
    amount = formatter.format(Number(priceMoney.amount) / 100) ?? "$??.??";
  }

  const data = {
    handle: product.id,
    title: product.itemData?.name ?? "Unknown Product Name.",
    image: {
      url: image ?? getPlaceholderImage(product.itemData?.name ?? "PH"),
      alt: imageAlt ?? "Product Image",
    },
    description: product.itemData?.description ?? "Product Description",
    productType,
    onlineStoreUrl: `https://midwestraptorjunkies.com/shop/product/${product.id}`,
    priceRange: {
      maxVariantPrice: {
        amount,
        currencyCode: priceCode,
      },
      minVariantPrice: {
        amount,
        currencyCode: priceCode,
      },
    },
  };
  return data;
};
class SquareClient {
  constructor(
    private merchant_id: string,
    private token: string,
    private is_dev: boolean = false,
  ) {}
  async productsMatching(search: string) {
    const data = await this.fetch<SearchCatalogObjectsResponse>("list", {
      search,
    });
    if (!data?.objects) return [];
    return data.objects.map((item) =>
      squareToShopifyProduct(item, data.relatedObjects),
    );
  }

  async productByHandle(handle: string) {
    const data = await this.fetch<RetrieveCatalogObjectResponse>("item", {
      id: handle,
    });
    if (!data.object) return null;
    return squareToShopifyProduct(data.object, data.relatedObjects);
  }

  async fetch<T>(mode: "list" | "item", data: Record<string, unknown>) {
    const response = await AuthFetch(`/api/plugin/square?mode=${mode}`, {
      method: "POST",
      json: {
        ...data,
        sandbox: this.is_dev,
        token: this.token,
      },
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

    const body = (await response.json()) as ApiResponse<
      T & { errors?: unknown[] }
    >["result"];

    if ("errors" in body) {
      throw new APIError("Failed Square API request.", {
        cause: response.statusText ?? "SQUARE_API_ERROR",
      });
    }

    return body;
  }
}

export default SquareClient;
