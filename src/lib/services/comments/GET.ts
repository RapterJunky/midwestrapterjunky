import type { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { z } from "zod";

import prisma from "@api/prisma";

const schema = z.object({
    post: z.string().uuid(),
    parent: z.string().uuid().optional(),
    page: z.coerce.number().positive().min(1).optional().default(1),
});

const GET = async (req: NextApiRequest, res: NextApiResponse, session: Session | null) => {
    const { post, page, parent } = schema.parse(req.query);

    const [comments, meta] = await prisma.comment.paginate({
        where: {
            threadPostId: post,
            parentCommentId: parent ?? null
        },
        select: {
            id: true,
            content: true,
            created: true,
            _count: {
                select: {
                    likes: true,
                    // children: !parent
                }
            },
            owner: {
                select: {
                    image: true,
                    id: true,
                    name: true,
                },
            },
            parentCommentId: true,
        },
        orderBy: {
            created: "desc",
        },
    }).withPages({ limit: 20, page });

    const likes = session ? await prisma.like.findMany({
        where: {
            userId: session?.user.id,
            commentId: { in: comments.map(value => value.id) }
        }
    }) : [];

    let result = [];
    for (const comment of comments) {
        const { _count, ...commentFields } = comment;
        result.push({
            ...commentFields,
            //children: _count.children,
            likedByMe: !!likes.find(like => like.commentId === comment.id),
            likeCount: _count.likes
        });
    }

    return res.status(200).json({ result: result, ...meta });
}

export default GET;