import { useState, useMemo } from 'react';
import ShopifyClient, { type Product } from '../../utils/plugin/ShopifyClient';
import { normalizeProduct ,normalizeConfig, ConvertToShopifyProduct,  type Freewebstore , type FreewebstoreProduct } from '../../../lib/utils/plugin/types';

export type ShopType = "shopify" | "freewebstore";
export type Status = 'loading' | 'success' | 'error';

const useStore = (ctx: any) => {
  const [query,setQuery] = useState<string>("");
  const [shop,setShop] = useState<ShopType>("shopify");
  const [products,setProducts] = useState<({ type: ShopType; product: Product }[] | null)>(null);
  const [status,setStatus] = useState<Status>("loading");

  const config = normalizeConfig(ctx.plugin.attributes.parameters);

  const client = useMemo(() => {
    return new ShopifyClient({ shopifyDomain: config.shopifyDomain, storefrontAccessToken: config.storefrontAccessToken });
  }, [config.storefrontAccessToken, config.shopifyDomain]);

  const fetchProductByHandle = async (item: { handle: string; type: ShopType }) => {
    try {
      setStatus("loading");

      if(item.type === "shopify") {
        const product = await client.productByHandle(item.handle);

        setProducts([{ type: item.type, product }]);
        setStatus("success");
        return;
      }

      const request = await fetch(`https://api.freewebstore.com/product/${item.handle}`,{
        headers: {
          "x-api-key": config.freeStoreApiKey
        }
      });
      if(!request.ok) throw request;

      const response = await request.json() as Freewebstore;

      setProducts([{ type: "freewebstore", product: normalizeProduct(response,config.freestoreDomain) }]);
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

      if(shop === "shopify") {
        const products = await client.productsMatching(query);
        const data = products.map(value=>({ type: "shopify" as ShopType, product: value }));

        setProducts(data);
        setStatus("success");
        return;
      }

      const request = await fetch('https://api.freewebstore.com/product/',{
        headers: {
          "x-api-key": config.freeStoreApiKey
        }
      });
      if(!request.ok) throw request;

      const response = await request.json() as { products: FreewebstoreProduct[] };
      const data = response.products.map(value=>({ type: "freewebstore" as ShopType, product: ConvertToShopifyProduct(value,config.freestoreDomain) })).filter(value=>value.product.title.includes(query));

      setProducts(data);
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
