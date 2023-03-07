import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import paginator from "prisma-paginate";
import prisma from "@api/prisma";
import { strToNum } from "@utils/strToNum";

const requestSchema = z.object({
    page: z.string().transform(strToNum),
    thread: z.string().transform(strToNum),
    search: z.string().optional().transform(value => {
        if (value) return decodeURIComponent(value);
        return value;
    })
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { page, thread, search } = requestSchema.parse(req.query);

        const paginate = paginator(prisma.threadPost);

        const data = await paginate.paginate({
            where: {
                threadId: thread,
                AND: search ? {
                    name: {
                        contains: search
                    }
                } : undefined
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
                created: "asc"
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

        return res.status(ie.statusCode).json(ie);
    }
}

