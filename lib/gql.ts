import { GraphQLClient, type Variables } from 'graphql-request';
import type { PatchedRequestInit } from 'graphql-request/dist/types';

const DATO_CMS = "https://graphql.datocms.com/";

interface FetchOptions {
    variables?: Variables,
    preview?: boolean,
}

export async function DATOCMS_Fetch<T extends Object>(query: string, opts?: FetchOptions): Promise<T> {
    return GQLFetch<T>(`${DATO_CMS}${opts?.preview ? "preview" : ""}`,query,opts,{
        headers: {
            Authorization: `Bearer ${process.env.DATOCMS_READONLY_TOKEN}`
        }
    });
}
export async function Shopify_Fetch<T extends Object>(query: string, opts?: FetchOptions): Promise<T> {
    return GQLFetch<T>(`https://${process.env.SHOPIFY_DOMAIN}.myshopify.com/api/graphql`,query,opts,{
        headers: {
            'X-Shopify-Storefront-Access-Token': process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN as string
        }
    });
}

async function GQLFetch<T extends Object>(url: string, query: string, { variables }: FetchOptions = {}, opts?: PatchedRequestInit): Promise<T> {
    
    const client = new GraphQLClient(url,opts);

    const request = await client.rawRequest(query,variables);

    if(request?.errors) {
        console.error(request.errors);
        throw new Error(`Failed fetch data from (${url})`);
    } 

    return request.data;
}