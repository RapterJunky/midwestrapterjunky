import { NextResponse } from "next/server";
import { Client } from "square";
import { z } from "zod";
import onError from "@/lib/api/handleError";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const id = z.string().parse(searchParams.get("item"));

        const client = new Client({
            accessToken: process.env.SQAURE_ACCESS_TOKEN,
            environment: process.env.SQUARE_MODE,
        });

        const { result } = await client.inventoryApi.retrieveInventoryCount(id);

        const counts = result.counts;

        if (!counts) return NextResponse.json([]);

        return NextResponse.json(counts);
    } catch (error) {
        return onError(error);
    }
}