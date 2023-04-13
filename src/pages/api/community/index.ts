import { handleError } from "@/lib/api/errorHandler";
import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@api/prisma";
import { z } from "zod";

const getSchema = z.object({
    sort: z.enum(["latest", "top"]),
    page: z.coerce.number().min(1).optional().default(1)
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        switch (req.method) {
            case "GET": {
                const { sort, page } = getSchema.parse(req.query);

                const [posts, meta] = await prisma.threadPost.paginate({
                    select: {
                        id: true,
                        name: true,
                        comments: {
                            take: 1,
                            orderBy: {
                                created: "desc"
                            },
                            select: {
                                created: true
                            }
                        }
                        // tags
                    },
                    orderBy: sort === "latest" ? {
                        created: "desc"
                    } : {
                        comments: {
                            _count: "desc"
                        }
                    }
                }).withPages({
                    includePageCount: true,
                    limit: 15,
                    page: page
                });

                return res.status(200).json({ result: posts, ...meta });
            }
            default:
                throw createHttpError.MethodNotAllowed();
        }
    } catch (error) {
        return handleError(error, res);
    }
}

export default handler;