import { NextResponse } from "next/server";
import {
  Client,
  Environment,
  type RetrieveCatalogObjectResponse,
  type SearchCatalogObjectsResponse,
} from "square";
import { serialize } from "superjson";
import { z } from "zod";

const modeQuery = z.enum(["item", "list"]).describe("Type of request");

const schema = z.object({
  token: z.string().nonempty().describe("Auth token"),
  sandbox: z
    .boolean()
    .describe("Is this request to be in sandbox mode")
    .transform((arg) => (arg ? Environment.Sandbox : Environment.Production)),
});

const searchRequest = z.object({
  search: z.string().describe("Search query"),
});
const fetchItem = z.object({
  id: z.string().nonempty().describe("Id of product to fetch"),
});

async function POST(request: Request) {
  const { searchParams } = new URL(request.url);

  const body = await request.json();

  const mode = modeQuery.parse(searchParams.get("mode"));
  const { token, sandbox } = schema.parse(body);

  const client = new Client({
    accessToken: token,
    environment: sandbox,
  });

  if (mode === "list") {
    const { search } = searchRequest.parse(body);
    const objects = await client.catalogApi.searchCatalogObjects({
      limit: 10,
      includeDeletedObjects: false,
      includeRelatedObjects: true,
      objectTypes: ["ITEM"],
      query: search.length
        ? {
            textQuery: {
              keywords: search.split(" "),
            },
          }
        : undefined,
    });

    const { json } = serialize(objects.result);

    return NextResponse.json(json as SearchCatalogObjectsResponse);
  }

  const { id } = fetchItem.parse(body);

  const item = await client.catalogApi.retrieveCatalogObject(id, true);

  const { json } = serialize(item.result);

  return NextResponse.json(json as RetrieveCatalogObjectResponse);
}

const handlers = {
  POST,
};

export default handlers;
