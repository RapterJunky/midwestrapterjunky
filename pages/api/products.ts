import createHttpError from "http-errors";
import { NextApiRequest, NextApiResponse } from "next";
import { getKeys } from "../../lib/dynamic_keys";
import { Shopify_Fetch } from '../../lib/gql';
import { type Freewebstore } from "../../lib/utils/plugin/types";

const fetch_freestore = async (api: string, data: { index: number; handle: string; }) => {
    const request = await fetch(`https://api.freewebstore.com/product/${data.handle}`,{
        headers: {
            "x-api-key": api
        }
    })

    if(!request.ok) throw request;

    const response = await request.json() as Freewebstore;
    return [{
        product: {
            featuredImage: {
                altText: "",
                url: response.images.primary
            },
            onlineStoreUrl: "",
            title: response.name,
            handle: response.id,
            priceRange: {
                maxVariantPrice: {
                    amount: response.price,
                    currencyCode: "USD",
                },
                minVariantPrice: {
                    amount: "0",
                    currencyCode: "USD"
                }
            }
        },
        index: data.index
    }];
}

const fetch_shopify = async (query: string, args: { SHOPIFY_STOREFRONT_ACCESS_TOKEN: string; SHOPIFY_DOMAIN: string; }) => {
    const data = await Shopify_Fetch(query,args);
    return Object.entries(data).map(([key, value])=>{
        return {
            index: parseInt(key.split("_")[1]),
            product: value
        }
    })
} 

export default async function handle(req: NextApiRequest, res: NextApiResponse){
    try {
        if(req.method !== "GET") throw createHttpError.MethodNotAllowed();   
        if(!req.query?.find) throw createHttpError.BadRequest();

        const keys = await getKeys(["SHOPIFY_STOREFRONT_ACCESS_TOKEN","SHOPIFY_DOMAIN","FREEWEBSTORE_API_TOKEN"] as const);
        const request = Buffer.from(req.query.find as string,"base64").toString("utf-8");

        let shopify_products: { index: number, handle: string; }[] = [];
        let free_shop: { index: number, handle: string }[] = [];

        request.split(",").forEach((value,i)=>{
            const [shop,handle] = value.split(":");
            if(shop === "s") return shopify_products.push({ handle, index: i });
            free_shop.push({ index:i, handle });
        });

        const shopify_query = shopify_products.map(value=>`
            item_${value.index}: productByHandle(handle: "${value.handle}") {
                featuredImage {
                    altText
                    url
                }
                title
                handle
                onlineStoreUrl
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
            }
        `).join("\n");

        const query = `query GetStoreItems {${shopify_query}}`;

        const data = await Promise.all([
            fetch_shopify(query,{ SHOPIFY_DOMAIN: keys.SHOPIFY_DOMAIN, SHOPIFY_STOREFRONT_ACCESS_TOKEN: keys.SHOPIFY_STOREFRONT_ACCESS_TOKEN }),
            ...free_shop.map(value=>fetch_freestore(keys.FREEWEBSTORE_API_TOKEN,value))
        ]);

        // cache for 2 hours
        if(!req.preview || process.env.VERCEL_ENV !== "development") res.setHeader("Cache-Control", "public, max-age=7200, immutable");
        return res.status(200).json(data.flat().sort((a,b)=>a.index-b.index).map(value=>value.product));
    } catch (error) {
        console.error(error);
        if(createHttpError.isHttpError(error)) {
            return res.status(error.statusCode).json(error);
        }

        const ie = createHttpError.InternalServerError();
        return res.status(ie.statusCode).json(ie);
    }
}