import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import createHttpError from "http-errors";
import { getSession } from "@/lib/getSession";
import { applyRateLimit } from "@/lib/api/rateLimiter";
import { handleError } from "@/lib/api/errorHandler";
import { z } from 'zod';

const tagsSchema = z.array(z.string().min(3).max(15)).max(6);

const schema = z.object({
    type: z.enum(["post", "comment"]),
    title: z.string().nonempty(),
    tags: tagsSchema.or(z.string().transform(val => [val]).pipe(tagsSchema)),
    message: z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str);
        } catch (error) {
            ctx.addIssue({ code: "custom", message: "Invaild JSON" });
            return z.NEVER;
        }
    }).pipe(z.array(z.object({ type: z.string() })).min(1)),
    imageData: z.record(z.string().uuid(), z.string().transform((str, ctx) => {
        try {
            return JSON.parse(str);
        } catch (error) {
            ctx.addIssue({ code: "custom", message: "Invaild JSON" });
            return z.NEVER;
        }
    }).pipe(z.object({ width: z.number(), height: z.number() })))
});

export const config = {
    api: {
        bodyParser: false
    }
}

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== "POST") throw createHttpError.MethodNotAllowed();
        await applyRateLimit(req, res);
        const session = await getSession(req, res);

        const form = new IncomingForm({
            keepExtensions: true,
            allowEmptyFiles: false,
            multiples: true,
            maxFiles: 10
        });

        const formData = await new Promise((ok, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);

                const data = schema.safeParse(fields);

                if (!data.success) return reject(err.error);

                ok({
                    data: data.data,
                    files
                });
            });
        });

        console.log(formData);

        return res.status(201).json({})
    } catch (error) {
        return handleError(req, res);
    }
}

export default handle;