export type PriceTypes = {
  amount: number | string;
  currencyCode: string;
};

export type Product = {
  handle: string;
  description: string;
  title: string;
  productType: string;
  onlineStoreUrl: string;
  imageUrl: string;
  priceRange: {
    maxVariantPrice: PriceTypes;
    minVariantPrice: PriceTypes;
  };
  images: {
    edges: [
      {
        node: {
          src: string;
        };
      }
    ];
  };
};

export type Products = {
  edges: [{ node: Product }];
};

const productFragment = `
  id
  title
  handle
  description
  onlineStoreUrl
  availableForSale
  productType
  priceRange {
    maxVariantPrice {
      amount
      currencyCode
    }
    minVariantPrice {
      amount
      currencyCode
    }
  }
  images(first: 1) {
    edges {
      node {
        src: transformedSrc(crop: CENTER, maxWidth: 200, maxHeight: 200)
      }
    }
  }
`;

export class APIError extends Error {}

const normalizeProduct = (product: Product): Product => {
  if (!product || typeof product !== "object") {
    throw new Error("Invalid product");
  }

  return {
    ...product,
    imageUrl: product.images.edges[0]?.node.src || "",
  };
};

const normalizeProducts = (products: Products): Product[] =>
  products.edges.map((edge) => normalizeProduct(edge.node));

export default class ShopifyClient {
  private storefrontAccessToken: string;
  private shopifyDomain: string;

  constructor({
    storefrontAccessToken,
    shopifyDomain,
  }: {
    shopifyDomain: string;
    storefrontAccessToken: string;
  }) {
    this.storefrontAccessToken = storefrontAccessToken;
    this.shopifyDomain = shopifyDomain;
  }

  async productsMatching(query: string) {
    const response = await this.fetch<{ products: Products }>({
      query: `
          query getProducts($query: String) {
            shop {
              products(first: 10, query: $query) {
                edges {
                  node {
                    ${productFragment}
                  }
                }
              }
            }
          }
        `,
      variables: { query: query || null },
    });

    return normalizeProducts(response.shop.products);
  }

  async productByHandle(handle: string) {
    const response = await this.fetch<{ product: Product }>({
      query: `
          query getProduct($handle: String!) {
            shop {
              product: productByHandle(handle: $handle) {
                ${productFragment}
              }
            }
          }
        `,
      variables: { handle },
    });

    return normalizeProduct(response.shop.product);
  }

  async fetch<T extends object>(requestBody: object) {
    const res = await fetch(
      `https://${this.shopifyDomain}.myshopify.com/api/graphql`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": this.storefrontAccessToken,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (res.status !== 200) {
      throw new APIError(`Invalid status code: ${res.status}`, {
        cause: "FAILED_NETWORK_REQUEST",
      });
    }

    const contentType = res.headers.get("content-type");

    if (!contentType || !contentType.includes("application/json")) {
      throw new APIError(`Invalid content type: ${contentType}`, {
        cause: "INVAILD_PRODUCT_CONTENT",
      });
    }

    const body = (await res.json()) as { data: { shop: T } };

    return body.data;
  }
}
