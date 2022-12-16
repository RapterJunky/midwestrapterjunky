import type { Product } from "./ShopifyClient";

export type FirstInstallationParamerters = {};
export type VaildConfig = {
    shopifyDomain: string;
    freestoreDomain: string;
    storefrontAccessToken: string;
    autoApplyToFieldsWithApiKey: string;
    freeStoreApiKey: string;
    keyToken: string;
    useOnlyStore: "null" | "shopify" | "freewebstore"
    paramsVersion: '6'
}

export interface FreewebstoreProduct {
    "rrp": string,
    "option_ids": string[];
    "condition": string,
    "categoryId": string,
    "disabled": boolean,
    "featured": boolean,
    "offer_price": number,
    "tax_rate": number,
    "tags": string[],
    "is_option_stock": boolean,
    "hidden": boolean,
    "formId": string,
    "updatedon": string,
    "id": string,
    "name": string,
    "image": string,
    "price": number,
    "sku": string,
    "created": string,
    "stock": number,
    "rating": string,
    "weight": string,
    "shipping": string,
    "hits": number,
    "sold": number,
    "stars": string,
    "google_online": boolean,
    "supplierId": string,
    "brandId": string,
    "offer": boolean
}

export interface Freewebstore {
  "id": number,
  "name": string,
  "code": string,
  "price": number,
  "live_price": number,
  "base_price": number,
  "description_length": number,
  "category": {
    "primary": number,
    "name": string,
    "other": string[]
  },
  "images": {
    "primary": string
  },
  "seo": {
    "title": string,
    "keywords": string[],
    "description": string
  },
}

export type Config = VaildConfig | FirstInstallationParamerters;

export function isVaildConfig(params: Config): params is VaildConfig {
    return params && 'paramsVersion' in params && params.paramsVersion === '6';
}

export function normalizeConfig(params: Config): VaildConfig {
    if(isVaildConfig(params)) return params;

    const accessToken = "storefrontAccessToken" in params;
    const domain = "shopifyDomain" in params;
    const freestoreDomain = "freestoreDomain" in params;

    return {
        paramsVersion: '6',
        freestoreDomain: freestoreDomain ? (params as any)?.freestoreDomain : "",
        storefrontAccessToken: accessToken ? (params as any)?.storefrontAccessToken : '078bc5caa0ddebfa89cccb4a1baa1f5c',
        shopifyDomain: domain ? (params as any)?.shopifyDomain : 'graphql',
        freeStoreApiKey: '',
        useOnlyStore: "null",
        keyToken: '',
        autoApplyToFieldsWithApiKey: '',
    }
}

export function ConvertToShopifyProduct(value: FreewebstoreProduct, domain: string): Product {
    return {
        description: "",
        handle: value.id,
        imageUrl: `https://${domain}/images/${value.image}`,
        images: {
            edges: [
                {
                    node: {
                        src: value.image
                    }
                }
            ]
        },
        onlineStoreUrl: `https://${domain}/product/${value.name}`,
        priceRange: {
            maxVariantPrice: {
                amount: 0,
                currencyCode: ""
            },
            minVariantPrice: {
                amount: 0,
                currencyCode: ""
            }
        },
        productType: value.categoryId,
        title: value.name
    }
}
 
export function normalizeProduct(value: Freewebstore, domain: string): Product {
    return {
        title: value.name,
        description: value.seo.description,
        handle: value.id.toString(),
        imageUrl: value.images.primary,
        images: {
            edges: [
                {
                    node: {
                        src: value.images.primary
                    }
                }
            ]
        },
        onlineStoreUrl: `https://${domain}/product/${value.name}`,
        productType: value.category.name,
        priceRange: {
            maxVariantPrice: {
                amount: value.price,
                currencyCode: "USD"
            },
            minVariantPrice: {
                amount: 0,
                currencyCode: "USD"
            }
        }
    }
}