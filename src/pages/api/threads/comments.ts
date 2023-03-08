import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from 'node:crypto';
import { Prisma } from "@prisma/client";
import createHttpError from "http-errors";
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import paginator from "prisma-paginate";

import prisma from "@api/prisma";
import { strToNum } from "@utils/strToNum";
import { getServerSession } from 'next-auth';
import { authConfig } from "@api/auth";
import { logger } from "@lib/logger";


const getSchema = z.object({
    post: z.string().uuid(),
    page: z.string().default("1").transform(strToNum)
});
const postSchema = z.object({
    content: z.object({}).passthrough(),
    parentCommentId: z.string().uuid(),
    threadPostId: z.string().uuid()
});
const patchSchema = z.object({
    id: z.string().uuid(),
    content: z.object({}).passthrough(),
});
const deleteSchema = z.object({
    id: z.string().uuid()
});

//https://kittygiraudel.com/2022/05/16/rate-limit-nextjs-api-routes/
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case "GET": {
                const { post, page } = getSchema.parse(req.query);
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
            }

                break;
            case "POST": {
                const session = await getServerSession(req, res, authConfig);
                if (!session) throw createHttpError.Unauthorized();

                const { content, parentCommentId, threadPostId } = postSchema.parse(req.body);

                const result = await prisma.comment.create({
                    data: {
                        id: randomUUID(),
                        content,
                        ownerId: session.user.id,
                        threadPostId,
                        parentCommentId
                    }
                });

                return res.status(201).json(result);
            }
            case "PATCH": {
                const session = await getServerSession(req, res, authConfig);
                if (!session) throw createHttpError.Unauthorized();
                const { content, id } = patchSchema.parse(req.body);

                const result = await prisma.comment.update({
                    where: {
                        id
                    },
                    data: {
                        content
                    }
                });

                return res.status(200).json(result);
            }
            case "DELETE": {
                const { id } = deleteSchema.parse(req.body);
                const result = await prisma.comment.delete({
                    where: {
                        id
                    }
                });
                return res.status(200).json(result);
            }
            default:
                throw createHttpError.MethodNotAllowed();
        }
    } catch (error) {
        logger.error(error);
        if (error instanceof ZodError) {
            const data = fromZodError(error);

            return res.status(400).json({
                message: data.message,
                details: data.details
            });
        }
        if (error instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (createHttpError.isHttpError(error)) {
            return res.status(error.statusCode).json(error);
        }

        const ie = createHttpError.InternalServerError();

        return res.status(ie.statusCode).json(ie);
    }
}

