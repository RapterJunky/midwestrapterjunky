import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z, ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
import { logger } from "@lib/logger";
import { getKeys } from "@lib/dynamic_keys";
import { Shopify_Fetch } from '@lib/gql';
import { type Freewebstore } from "@utils/plugin/types";

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

const inputValidation = z.string().transform(value=>Buffer.from(value,"base64").toString("utf-8"));

export default async function handle(req: NextApiRequest, res: NextApiResponse){
    try {
        if(req.method !== "GET") throw createHttpError.MethodNotAllowed();   
      
        const request = inputValidation.parse(req.query?.find);

        const keys = await getKeys(["SHOPIFY_STOREFRONT_ACCESS_TOKEN","SHOPIFY_DOMAIN","FREEWEBSTORE_API_TOKEN"] as const);
       
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
        if(createHttpError.isHttpError(error)) {
            logger.error(error,error.message);
            return res.status(error.statusCode).json(error);
        }

        if(error instanceof ZodError) {
            const status = createHttpError.BadRequest();
            const display = fromZodError(error);
            logger.error(error,display.message);
            return res.status(status.statusCode).json({ message: status.message, details: display.details });
        }

        const ie = createHttpError.InternalServerError();
        logger.error(error,ie.message);
        return res.status(ie.statusCode).json(ie);
    }
}