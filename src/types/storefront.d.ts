/* eslint-disable @typescript-eslint/no-unused-vars*/
module Storefront {
  type StorefrontType = "S" | "F" | "ST" | "SQ";

  type Product = {
    handle: string;
    title: string;
    image: {
      url: string;
      alt: string;
    };
    description: string;
    productType: string;
    onlineStoreUrl: string;
    priceRange: {
      maxVariantPrice: {
        amount: string;
        currencyCode: string;
      };
      minVariantPrice: {
        amount: string;
        currencyCode: string;
      };
    };
  };
}
