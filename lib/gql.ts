import { GraphQLClient, type Variables } from 'graphql-request';

const DATO_CMS = "https://graphql.datocms.com/";

interface FetchOptions {
    variables?: Variables,
    preview?: boolean
}

export async function GQLFetch(query: string, { variables, preview }: FetchOptions = {}) {
    
    const client = new GraphQLClient(`${DATO_CMS}${preview ? "preview" : ""}`,{
        headers: {
            Authorization: `Bearer ${process.env.DATOCMS_READONLY_TOKEN}`
        }
    });

    const request = await client.rawRequest(query,variables);

    if(request?.errors) {
        console.error(request.errors);
        throw new Error("Failed to make request");
    } 

    return request.data;
}

export const NavbarFragment = `
    navbar {
        bgColor {
        hex
        }
        pageLinks {
        title
        link
        }
    }
`;