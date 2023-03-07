import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import paginator from "prisma-paginate";
import prisma from "@api/prisma";
import { strToNum } from "@utils/strToNum";

const requestSchema = z.object({
    post: z.string(),
    page: z.string().default("1").transform(strToNum)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { post, page } = requestSchema.parse(req.query);
        const paginate = paginator(prisma.comment);

        const data = await paginate.paginate({
            where: {
                threadPostId: post,
            },
            select: {
                id: true,
                content: true,
                created: true,
                owner: {
                    select: {
                        image: true,
                        id: true,
                        name: true
                    }
                },
                parentCommentId: true,
            },
            orderBy: {
                created: "asc"
            }
        }, { limit: 20, page });

        return res.status(200).json(data);
    } catch (error) {
        if (error instanceof ZodError) {
            const { message, details } = fromZodError(error);
            return res.status(400).json({ message, details });
        }

        const ie = createHttpError.InternalServerError();
        return res.status(ie.statusCode).json(ie);
    }
}

