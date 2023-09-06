import createHttpError from "http-errors";
import { NextResponse } from "next/server";
import { z } from 'zod';

import { uploadFileCMS } from "@/lib/api/googleDrive";
import onError from "@/lib/api/handleError";

const schema = z.object({
    alt: z.string().optional().default("Upload Image"),
    image: z.object({})
});

export async function POST(request: Request) {
    try {
        const authorization = request.headers.get("authorization");
        if (
            !authorization ||
            authorization.replace("Bearer ", "") !==
            process.env.PLUGIN_TOKEN
        ) throw createHttpError.Unauthorized();

        const body = await request.formData();

        const { alt } = schema.parse(Object.fromEntries(body.entries()))

        const result = await uploadFileCMS(body.get("image") as never as File, alt);

        return NextResponse.json(result);
    } catch (error) {
        return onError(error);
    }
}