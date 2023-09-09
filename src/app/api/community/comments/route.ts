import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { REVALIDATE_IN_1H } from "@/lib/revaildateTimings";
import { authConfig } from "@/lib/config/auth";
import onError from "@/lib/api/handleError";
import prisma from "@/lib/api/prisma";

const schema = z.object({
  post: z.string().uuid(),
  parent: z.string().uuid().optional(),
  page: z.coerce.number().positive().min(1).optional().default(1),
});

export const dynamic = "force-dynamic";
export const revalidate = REVALIDATE_IN_1H;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    const { searchParams } = request.nextUrl;

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
