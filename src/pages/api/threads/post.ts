import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import createHttpError from "http-errors";
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import paginator from "prisma-paginate";
import prisma from "@api/prisma";
import { strToNum } from "@utils/strToNum";
import { logger } from "@lib/logger";
import { getServerSession } from 'next-auth';
import { authConfig } from "@api/auth";

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

const auth = async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getServerSession(req, res, authConfig);
    if (!session) throw createHttpError.Unauthorized();
    return session;
}

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
                const session = await auth(req, res);
                const { name, threadId, content } = postSchema.parse(req.body);
                const [userExists, threadExists] = await prisma.$transaction([
                    prisma.user.count({
                        where: {
                            id: session.user.id
                        }
                    }),
                    prisma.thread.count({
                        where: {
                            id: threadId
                        }
                    }),
                ]);

                if (!userExists || !threadExists) throw createHttpError.NotFound("Provided user was not found.");

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
                const session = await auth(req, res);
                const { name, id, content } = patchSchema.parse(req.body);

                if (!name && !content) return res.status(200).json({ message: "No Change" });

                const exists = await prisma.threadPost.count({
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
                const session = await auth(req, res);

                const { id } = deleteSchema.parse(req.body);

                const exists = await prisma.threadPost.count({
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