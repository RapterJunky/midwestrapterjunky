import { useState, useMemo } from 'react';
import ShopifyClient, { type Product } from '@utils/plugin/ShopifyClient';
import { type VaildConfig } from '@utils/plugin/types';

export type ShopType = "shopify" | "freewebstore";
export type Status = 'loading' | 'success' | 'error';

const useStore = (ctx: VaildConfig) => {
  const [query,setQuery] = useState<string>("");
  const [shop,setShop] = useState<VaildConfig["storefronts"][0]|undefined>(ctx.storefronts[0]);
  const [products,setProducts] = useState<(Product[] | null)>(null);
  const [status,setStatus] = useState<Status>("loading");
  
  const client = useMemo(() => {
    if(!shop?.domain || !shop.token) return null;
    return new ShopifyClient({ shopifyDomain: shop?.domain, storefrontAccessToken: shop?.token });
  }, [shop?.domain, shop?.token]);

  const fetchProductByHandle = async (item: string) => {
    try {
      setStatus("loading");

      if(!client) throw new Error("No Client");

      const product = await client.productByHandle(item);

      setProducts([product]);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setProducts(null);
      setStatus("error");
    }
  }
  const fetchProductByMatching = async (query: string) => {
    try {
      setStatus("loading");

      if(!client) throw new Error("No Client");
      const products = await client.productsMatching(query);

      setProducts(products);
      setStatus("success");
    } catch (error) {
      setProducts(null);
      setStatus("error");
    }
  }

  return {
    shop,
    setShop,
    setQuery,
    status,
    products,
    query,
    fetchProductByHandle,
    fetchProductByMatching
  }
}



export default useStore;
