import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";
import { google } from "googleapis";
import { z } from "zod";

import { logger } from "@lib/logger";
import prisma from "@api/prisma";

const schema = z.object({
  type: z.enum(["like", "comment"]),
  id: z.string().uuid(),
});

const DELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null
) => {
  if (!session) throw createHttpError.Unauthorized();
  const { id, type } = schema.parse(req.body);

  switch (type) {
    case "like": {
      const data = await prisma.like.delete({
        where: {
          id: `${session.user.id}${id}`,
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
        throw createHttpError.InternalServerError("Failed to get comment");

      const { _count, ...comment } = data.comment;

      return res.status(200).json({
        ...comment,
        likedByMe: false,
        likeCount: _count.likes - 1,
      });
    }
    case "comment": {
      const data = await prisma.comment.findFirst({
        where: {
          id,
          AND: {
            ownerId: session.user.id,
          },
        },
        select: {
          parentCommentId: true,
          content: true,
          id: true,
        },
      });

      if (!data)
        throw createHttpError.NotFound("No comment with given owner exists.");

      if (!data.parentCommentId) {
        await prisma.comment.deleteMany({
          where: {
            parentCommentId: data.id,
          },
        });
      }

      await prisma.comment.delete({
        where: {
          id: data.id,
        },
      });

      if (data.content.blocks) {
        const images = (
          data.content.blocks as {
            __typename: string;
            content: { imageId: string };
          }[]
        ).filter((block) => block.__typename === "ImageRecord");

        if (images.length) {
          const auth = new google.auth.GoogleAuth({
            scopes: ["https://www.googleapis.com/auth/drive"],
          });
          const driveService = google.drive({ version: "v3", auth });

          const results = await Promise.allSettled(
            images.map((image) => {
              return driveService.files.delete({
                fileId: image.content.imageId,
              });
            })
          );

          for (const result of results) {
            if (result.status !== "rejected") continue;
            logger.error(result.reason);
          }
        }
      }

      return res.status(200).json({ ok: true });
    }
  }
};

export default DELETE;
