import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { Session } from "next-auth";
import { z } from "zod";

const schema = z.object({
    type: z.enum(["like", "comment"]),
    id: z.string().uuid()
})

const DELETE = async (req: NextApiRequest, res: NextApiResponse, session: Session | null) => {
    if (!session) throw createHttpError.Unauthorized();
    const { id, type } = schema.parse(req.body);

    switch (type) {
        case "like": {
            const data = await prisma.like.delete({
                where: {
                    id: `${session.user.id}${id}`
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

            if (!data.comment) throw createHttpError.InternalServerError("Failed to get comment");

            const { _count, ...comment } = data.comment;

            return res.status(200).json({
                ...comment,
                likedByMe: false,
                likeCount: _count.likes - 1
            });
        }
        case "comment": {
            const { count } = await prisma.comment.deleteMany({
                where: {
                    id,
                    AND: {
                        ownerId: session.user.id
                    }
                }
            })

            if (count === 0) throw createHttpError.NotFound("No comment with given owner exists.")

            return res.status(200).json({ count });
        }
    }
}

export default DELETE;