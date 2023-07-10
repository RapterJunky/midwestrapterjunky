import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";
import { z } from "zod";

import dastToSlate from "@lib/utils/editor/dastToSlate";
import prisma from "@api/prisma";

const schema = z.object({ id: z.string().uuid().nonempty() });

const emptyDocument = [{ type: "paragraph", children: [{ text: "" }] }];

/**
 * Return editable slate struct for editing post/comments
 */
const GET = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  type: "post" | "comment",
) => {
  const { id } = schema.parse(req.query);

  if (type === "comment") {
    const comment = await prisma.comment.findFirst({
      where: {
        id,
        ownerId: session.user.id,
      },
    });
    if (!comment)
      throw createHttpError.NotFound(
        "Failed to find comment with given id and user.",
      );

    if (!comment.content) throw new Error("Comment has not content.");

    return res.status(200).json({
      message: comment.content ? dastToSlate(comment.content) : emptyDocument,
    });
  }

  const post = await prisma.threadPost.findFirst({
    where: {
      id,
      ownerId: session.user.id,
    },
  });

  if (!post)
    throw createHttpError.NotFound(
      "Failed to find topic with given id and user.",
    );

  return res.status(200).json({
    title: post.name,
    notification: post.notifyOwner,
    tags: post.tags ?? [],
    categoryId: post.threadId,
    message: post.content ? dastToSlate(post.content) : emptyDocument,
  });
};

export default GET;
