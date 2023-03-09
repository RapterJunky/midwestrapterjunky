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
    page: z.string().default("1").transform(strToNum),
    thread: z.string({ required_error: "Thread query param is required." }).transform(strToNum),
    search: z.string().optional().transform(value => {
        if (value) return decodeURIComponent(value);
        return value;
    })
});
const postSchema = z.object({
    name: z.string(),
    threadId: z.number().positive(),
    content: z.object({})
});
const patchSchema = z.object({
    name: z.string().optional(),
    id: z.string().uuid(),
    content: z.object({}).passthrough().optional()
});
const deleteSchema = z.object({
    id: z.string().uuid()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case "GET": {
                const { page, thread, search } = getSchema.parse(req.query);
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
            }
            case "POST": {
                await applyRateLimit(req, res);
                const session = await getSession(req, res);
                const { name, threadId, content } = postSchema.parse(req.body);

                const exists = prisma.thread.findFirst({
                    where: {
                        id: threadId
                    }
                });

                if (!exists) throw createHttpError.NotFound("Provided thread does not exist.");

                const result = await prisma.threadPost.create({
                    data: {
                        id: randomUUID(),
                        name,
                        ownerId: session.user.id,
                        threadId,
                        content
                    }
                });

                return res.status(201).json(result);
            }
            case "PATCH": {
                await applyRateLimit(req, res);
                const session = await getSession(req, res);
                const { name, id, content } = patchSchema.parse(req.body);

                if (!name && !content) return res.status(200).json({ message: "No Change" });

                const exists = await prisma.threadPost.findFirst({
                    where: {
                        id,
                        AND: {
                            ownerId: session.user.id
                        }
                    }
                });
                if (!exists) throw createHttpError.NotFound();

                const result = await prisma.threadPost.update({
                    where: {
                        id
                    },
                    data: {
                        name,
                        content
                    }
                });

                return res.status(200).json(result);
            }
            case "DELETE": {
                await applyRateLimit(req, res);
                const session = await getSession(req, res);
                const { id } = deleteSchema.parse(req.body);

                const exists = await prisma.threadPost.findFirst({
                    where: {
                        id,
                        AND: {
                            ownerId: session.user.id
                        }
                    }
                });

                if (!exists) throw createHttpError.NotFound();

                const result = await prisma.threadPost.delete({
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