import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import paginator from "prisma-paginate";
import prisma from "@api/prisma";

const strToNum = (arg: string, ctx: z.RefinementCtx) => {
    const parsed = parseInt(arg);
    if (isNaN(parsed)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Not a number",
        });
        return z.NEVER;
    }
    return parsed;
}

const requestSchema = z.object({
    page: z.string().transform(strToNum),
    thread: z.string().transform(strToNum)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { page, thread } = requestSchema.parse(req.query);

        const paginate = paginator(prisma.threadPost);

        const data = await paginate.paginate({
            where: {
                threadId: thread
            },
            select: {
                name: true,
                created: true,
                id: true,
                owner: {
                    select: {
                        name: true,
                        image: true
                    }
                }
            },
            orderBy: {
                created: "desc"
            }
        }, { limit: 20, page });

        return res.status(200).json(data);
    } catch (error) {
        if (error instanceof ZodError) {
            const data = fromZodError(error);

            return res.status(400).json({
                message: data.message,
                details: data.details
            });
        }

        console.log(error);

        const ie = createHttpError.InternalServerError();

        return res.status(500).json(ie);
    }
}

