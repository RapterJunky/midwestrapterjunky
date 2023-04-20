import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { randomUUID } from "node:crypto";
import type { Descendant } from 'slate';
import { Session } from "next-auth";
import { z } from "zod";

import { slateToDast } from "@lib/utils/slateToDast";

const schema = z.object({
    type: z.enum(["like", "comment", "report"])
});

const likeSchema = z.object({
    id: z.string().uuid(),
});

const reportSchema = likeSchema.extend({
    reason: z.string().nonempty(),
    id: z.string().uuid()
});

const createCommentSchema = z.object({
    data: z.array(z.object({ type: z.string() }).passthrough()).transform(e => slateToDast(e as Descendant[], {})),
    parentCommentId: z.string().uuid().nullable().optional(),
    postId: z.string().uuid().nonempty(),
});

const POST = async (req: NextApiRequest, res: NextApiResponse, session: Session | null) => {
    if (!session) throw createHttpError.Unauthorized();

    const { type } = schema.parse(req.body);

    switch (type) {
        case "comment": {
            const { data, parentCommentId, postId } = createCommentSchema.parse(
                req.body
            );

            if (!data) throw createHttpError.InternalServerError("Failed to transform message");
            const dast: PrismaJson.Dast = {
                blocks: [],
                value: data
            }

            const result = await prisma.comment.create({
                data: {
                    id: randomUUID(),
                    content: dast,
                    ownerId: session.user.id,
                    threadPostId: postId,
                    parentCommentId,
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
                            name: true,
                        },
                    },
                },
            });

            return res.status(201).json({
                ...result,
                likedByMe: false,
                likeCount: 0
            });
        }
        case "like": {
            const { id } = likeSchema.parse(req.body);

            const data = await prisma.like.create({
                data: {
                    id: `${session.user.id}${id}`,
                    type: "Comment",
                    userId: session.user.id,
                    commentId: id
                },
                select: {
                    comment: {
                        select: {
                            id: true,
                            content: true,
                            created: true,
                            parentCommentId: true,
                            _count: {
                                select: {
                                    likes: true
                                }
                            },
                            owner: {
                                select: {
                                    image: true,
                                    id: true,
                                    name: true,
                                },
                            },
                        }
                    }
                }
            });

            if (!data.comment) throw createHttpError.InternalServerError("No comment was returned");

            const { _count, ...comment } = data.comment;

            return res.status(201).json({
                ...comment,
                likedByMe: true,
                likeCount: _count.likes
            })
        }
        case "report": {
            const { id, reason } = reportSchema.parse(req.body);

            await prisma.report.create({
                data: {
                    ownerId: session.user.id,
                    commentId: id,
                    reason,
                    type: "Comment",
                },
            });

            return res.status(201).json({ message: "Reported" });
        }
    }
}

export default POST;