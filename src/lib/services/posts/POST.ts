import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { z } from "zod";

import prisma from "@api/prisma";
import { slateToDast } from "@/lib/utils/slateToDast";
import { Descendant } from "slate";
import { applyRateLimit } from "@/lib/api/rateLimiter";

const schema = z.object({
    type: z.enum(["like", "create", "report"])
});

const likeSchema = z.object({
    id: z.string().uuid()
})

const reportSchema = schema.extend({
    id: z.string().uuid(),
    reason: z.string().nonempty()
});

const createPostSchema = schema.extend({
    content: z.array(z.object({ type: z.string() }).passthrough()).transform(e => slateToDast(e as Descendant[], {})),
    title: z.string().min(3).max(40),
    tags: z.array(z.string()),
    categoryId: z.coerce.number().positive().min(1)
});

const POST = async (req: NextApiRequest, res: NextApiResponse, session: Session | null) => {
    if (!session) throw createHttpError.Unauthorized();
    await applyRateLimit(req, res);

    const { type } = schema.parse(req.body);

    switch (type) {
        case "report": {
            const { id, reason } = reportSchema.parse(req.body);

            await prisma.report.create({
                data: {
                    ownerId: session.user.id,
                    postId: id,
                    reason,
                    type: "Post",
                },
            });

            return res.status(201).json({ message: "Reported" });
        }
        case "like": {
            const { id } = likeSchema.parse(req.body);

            const data = await prisma.like.create({
                data: {
                    id: `${session.user.id}${id}`,
                    userId: session.user.id,
                    threadPostId: id,
                    type: "Post",
                },
                select: {
                    post: {
                        select: {
                            _count: {
                                select: {
                                    likes: true
                                }
                            }
                        }
                    }
                }
            });

            return res.status(201).json({
                likedByMe: true,
                likesCount: data.post?._count.likes ?? 1
            })
        }
        case "create": {
            const { content, title, tags, categoryId } = createPostSchema.parse(req.body);

            if (!content) throw createHttpError.BadRequest("Failed to parse message");

            const data = await prisma.threadPost.create({
                data: {
                    ownerId: session.user.id,
                    content: {
                        blocks: [],
                        value: content
                    },
                    name: title,
                    tags,
                    threadId: categoryId
                }
            });

            return res.status(200).json({ postId: data.id });
        }
    }

}

export default POST;