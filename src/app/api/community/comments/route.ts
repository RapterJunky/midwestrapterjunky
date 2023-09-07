import { z } from "zod";
import onError from "@/lib/api/handleError";
import prisma from "@/lib/api/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/config/auth";
import { NextResponse } from "next/server";

const schema = z.object({
  post: z.string().uuid(),
  parent: z.string().uuid().optional(),
  page: z.coerce.number().positive().min(1).optional().default(1),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    const { searchParams } = new URL(request.url);

    const { post, parent, page } = schema.parse(
      Object.fromEntries(searchParams.entries()),
    );

    const [comments, meta] = await prisma.comment
      .paginate({
        where: {
          threadPostId: post,
          parentCommentId: parent ?? null,
        },
        select: {
          id: true,
          content: true,
          created: true,
          _count: {
            select: {
              likes: true,
              // children: !parent
            },
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
      })
      .withPages({ limit: 20, page });

    const likes = session
      ? await prisma.like.findMany({
        where: {
          userId: session.user.id,
          commentId: { in: comments.map((value) => value.id) },
        },
      })
      : [];

    const result = [];
    for (const comment of comments) {
      const { _count, ...commentFields } = comment;
      result.push({
        ...commentFields,
        //children: _count.children,
        likedByMe: !!likes.find((like) => like.commentId === comment.id),
        likeCount: _count.likes,
      });
    }

    return NextResponse.json({
      result,
      ...meta,
    });
  } catch (error) {
    return onError(error);
  }
}
