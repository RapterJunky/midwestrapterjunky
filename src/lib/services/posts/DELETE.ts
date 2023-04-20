import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { z } from "zod";

import prisma from "@api/prisma";

const schema = z.object({
    type: z.enum(["post", "like"])
});

const likeSchema = schema.extend({
    id: z.string().uuid()
});

const DELETE = async (req: NextApiRequest, res: NextApiResponse, session: Session | null) => {
    if (!session) throw createHttpError.Unauthorized();

    const { type } = schema.parse(req.body);

    switch (type) {
        case "like": {
            const { id } = likeSchema.parse(req.body);

            const data = await prisma.like.delete({
                where: {
                    id: `${session.user.id}${id}`
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

            return res.status(200).json({
                likedByMe: false,
                likesCount: data.post?._count.likes ?? 0
            });
        }
        case "post": {
            throw createHttpError.NotImplemented();
        }
    }

}

export default DELETE;

