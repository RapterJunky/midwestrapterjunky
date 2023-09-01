import { NextResponse } from "next/server";
import { Client } from "square";
import { z } from "zod";
import onError from "@/lib/api/handleError";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const discount = z.string().parse(searchParams.get("discount"));

        const client = new Client({
            accessToken: process.env.SQAURE_ACCESS_TOKEN,
            environment: process.env.SQUARE_MODE
        });

        const { result } = await client.catalogApi.searchCatalogObjects({
            objectTypes: ["DISCOUNT"],
            includeDeletedObjects: false,
            query: {
                textQuery: {
                    keywords: discount.split(" "),
                },
            },
            limit: 1,
        });

        const discountItem = result.objects?.at(0);

        if (!discountItem) return NextResponse.json(null, { status: 404 });

        return NextResponse.json({
            id: discountItem.id,
            name: discountItem.discountData?.name ?? "Discount"
        });
    } catch (error) {
        return onError(error);
    }
}