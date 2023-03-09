import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from 'node:crypto';
import createHttpError from "http-errors";
import { z } from 'zod';
import paginator from "prisma-paginate";

import prisma from "@api/prisma";
import { strToNum } from "@utils/strToNum";
import { getSession } from "@lib/getSession";
import { handleError } from "@api/errorHandler";
import { applyRateLimit } from "@api/rateLimiter";

const getSchema = z.object({
    post: z.string().uuid(),
    page: z.string().default("1").transform(strToNum)
});
const postSchema = z.object({
    content: z.object({}).passthrough(),
    parentCommentId: z.string().uuid().nullable(),
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
            case "POST": {
                await applyRateLimit(req, res);
                const session = await getSession(req, res);
                const { content, parentCommentId, threadPostId } = postSchema.parse(req.body);

                const exists = await prisma.threadPost.findFirst({
                    where: {
                        id: threadPostId
                    }
                });
                if (!exists) throw createHttpError.NotFound("Given post id was not found");

                if (parentCommentId) {
                    const exists = await prisma.comment.findFirst({
                        where: {
                            id: parentCommentId
                        }
                    });
                    if (!exists) throw createHttpError.NotFound("Given parent comment id was not found");
                }

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
                await applyRateLimit(req, res);
                const session = await getSession(req, res);
                const { content, id } = patchSchema.parse(req.body);

                const exists = await prisma.comment.findFirst({
                    where: {
                        id,
                        AND: {
                            ownerId: session.user.id
                        }
                    }
                });
                if (!exists) throw createHttpError.NotFound();

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
                await applyRateLimit(req, res);
                const session = await getSession(req, res);
                const { id } = deleteSchema.parse(req.body);

                const exists = await prisma.comment.findFirst({
                    where: {
                        id,
                        AND: {
                            ownerId: session.user.id
                        }
                    }
                });
                if (!exists) throw createHttpError.NotFound();

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
        handleError(error, res);
    }
}
