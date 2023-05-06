import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";
import { z } from "zod";

import prisma from "@api/prisma";

const schema = z.object({
  type: z.enum(["like", "report"]),
});

const likeSchema = z.object({
  id: z.string().uuid(),
});

const reportSchema = likeSchema.extend({
  reason: z.string().nonempty(),
  id: z.string().uuid(),
});

const POST = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null
) => {
  if (!session) throw createHttpError.Unauthorized();

  const { type } = schema.parse(req.body);

  switch (type) {
    case "like": {
      const { id } = likeSchema.parse(req.body);

      const data = await prisma.like.create({
        data: {
          id: `${session.user.id}${id}`,
          type: "Comment",
          userId: session.user.id,
          commentId: id,
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
                  likes: true,
                },
              },
              owner: {
                select: {
                  image: true,
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!data.comment)
        throw createHttpError.InternalServerError("No comment was returned");

      const { _count, ...comment } = data.comment;

      return res.status(201).json({
        ...comment,
        children: 0,
        likedByMe: true,
        likeCount: _count.likes,
      });
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
};

export default POST;
