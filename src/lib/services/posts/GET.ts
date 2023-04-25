import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";
import { z } from "zod";

import prisma from "@api/prisma";

const schema = z.object({
  post: z.string().uuid(),
});

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null
) => {
  const { post } = schema.parse(req.query);

  const data = await prisma.threadPost.findUnique({
    where: {
      id: post,
    },
    select: {
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!data) throw createHttpError.BadRequest("Failed to find post");

  let likedByMe = false;

  if (session) {
    likedByMe = await prisma.like.exists({
      where: {
        id: `${session.user.id}${post}`,
      },
    });
  }

  return res.status(200).json({
    likesCount: data._count.likes,
    likedByMe,
  });
};

export default GET;
