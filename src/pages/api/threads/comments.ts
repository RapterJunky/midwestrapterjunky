import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from 'node:crypto';
import createHttpError from "http-errors";
import { z } from 'zod';

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
    content: z.object({ message: z.string() }),
    parentCommentId: z.string().uuid().nullable().optional(),
    threadPostId: z.string().uuid()
});

const patchSchema = z.object({
    id: z.string().uuid(),
    content: z.object({
        message: z.string()
    }),
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

                const [comments, meta] = await prisma.comment.paginate({
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
                }).withPages({ limit: 20, page });

                return res.status(200).json({ result: comments, ...meta });
            }
            case "POST": {
                await applyRateLimit(req, res);
                const session = await getSession(req, res);

                if (req.headers["x-comment-report"] === "true") {

                    const { id } = deleteSchema.parse(req.body);

                    console.log(`Comment ${id} reported by ${session.user.id}`);

                    return res.status(201).json({ message: "Reported" });
                }

                const { content, parentCommentId, threadPostId } = postSchema.parse(req.body);

                await prisma.threadPost.exists({
                    where: {
                        id: threadPostId
                    }
                }, createHttpError.NotFound("Given post id was not found"));


                if (parentCommentId) {
                    await prisma.comment.exists({
                        where: {
                            id: parentCommentId
                        }
                    }, createHttpError.NotFound("Given parent comment id was not found"));
                }

                const result = await prisma.comment.create({
                    data: {
                        id: randomUUID(),
                        content,
                        ownerId: session.user.id,
                        threadPostId,
                        parentCommentId
                    },
                    select: {
                        id: true,
                        content: true,
                        created: true,
                        parentCommentId: true,
                        owner: {
                            select: {
                                image: true,
                                id: true,
                                name: true
                            }
                        }
                    }
                });

                return res.status(201).json(result);
            }
            case "PATCH": {
                await applyRateLimit(req, res);
                const session = await getSession(req, res);
                const { content, id } = patchSchema.parse(req.body);

                await prisma.comment.exists({
                    where: {
                        id,
                        AND: {
                            ownerId: session.user.id
                        }
                    }
                }, createHttpError.NotFound());

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

                await prisma.comment.exists({
                    where: {
                        id,
                        AND: {
                            ownerId: session.user.id
                        }
                    }
                }, createHttpError.NotFound());

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

