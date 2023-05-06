import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";
import { google } from "googleapis";
import { z } from "zod";

import prisma from "@api/prisma";
import { logger } from "@lib/logger";

const schema = z.object({
  type: z.enum(["post", "like"]),
  id: z.string().uuid(),
});

const DELETE = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session | null
) => {
  if (!session) throw createHttpError.Unauthorized();

  const { type, id } = schema.parse(req.query);

  switch (type) {
    case "like": {
      const data = await prisma.like.delete({
        where: {
          id: `${session.user.id}${id}`,
        },
        select: {
          post: {
            select: {
              _count: {
                select: {
                  likes: true,
                },
              },
            },
          },
        },
      });

      return res.status(200).json({
        likedByMe: false,
        likesCount: data.post?._count.likes ?? 0,
      });
    }
    case "post": {
      const data = await prisma.threadPost.findFirst({
        where: {
          ownerId: session.user.id,
          id: id,
        },
      });

      if (!data) throw createHttpError.NotFound("Failed to post with user");

      await prisma.threadPost.delete({
        where: {
          id,
        },
      });

      // remove images
      if (data.content?.blocks) {
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
