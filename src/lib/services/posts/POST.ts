import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { z } from "zod";

import prisma from "@api/prisma";

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

const POST = async (req: NextApiRequest, res: NextApiResponse, session: Session | null) => {
    if (!session) throw createHttpError.Unauthorized();

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
            throw createHttpError.NotImplemented();
        }
    }

}

export default POST;