import type { NonTextNode } from "datocms-structured-text-slate-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";

import parseForm, { type TopicSchema, type CommentSchema, commentSchema, topicSchema } from "@lib/utils/editor/parseForm";
import { slateToDast } from "@lib/utils/editor/slateToDast";

/**
 * Handle updating post/comments with new slate content.
 * handle uploading new image and ignoring old images
 */
const handleTC = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  type: "post" | "comment"
) => {
  const schema = type === "comment" ? commentSchema : topicSchema;
  const formData = await parseForm(req, req.method as "PATCH" | "POST", schema);

  // check dast before having to handle image uploading.
  const dast = slateToDast(formData.fields.message as NonTextNode[]);
  if (!dast) throw createHttpError.BadRequest("Failed to vaildate dast");


  if (!dast.blocks) dast.blocks = [];

  dast.blocks.push(...formData.imagesBlocks);

  if (req.method === "PATCH") switch (type) {
    case "comment": {
      const comment = await prisma.comment.update({
        where: {
          id: formData.fields.editId
        },
        data: {
          content: dast,
        },
        select: {
          id: true,
          content: true,
          created: true,
          parentCommentId: true,
          owner: {
            select: {
              image: true,
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(201).json({
        ...comment,
        likedByMe: false,
        likeCount: 0,
      });
    }
    case "post": {
      const topic = await prisma.threadPost.update({
        where: {
          id: formData.fields.editId
        },
        data: {
          content: dast,
          name: (formData.fields as TopicSchema).title,
          tags: (formData.fields as TopicSchema).tags,
          threadId: (formData.fields as TopicSchema).thread,
        },
      });

      await res.revalidate(`/community/p/${topic.id}`);

      return res.status(201).json({ postId: topic.id });
    }
  }

  switch (type) {
    case "comment": {
      const comment = await prisma.comment.create({
        data: {
          ownerId: session.user.id,
          content: dast,
          parentCommentId: (formData.fields as CommentSchema).parentId,
          threadPostId: (formData.fields as CommentSchema).postId,
        },
        select: {
          id: true,
          content: true,
          created: true,
          parentCommentId: true,
          owner: {
            select: {
              image: true,
              id: true,
              name: true,
            },
          },
        },
      });

      return res.status(201).json({
        ...comment,
        likedByMe: false,
        likeCount: 0,
      });
    }
    case "post": {
      const topic = await prisma.threadPost.create({
        data: {
          ownerId: session.user.id,
          content: dast,
          name: (formData.fields as TopicSchema).title,
          tags: (formData.fields as TopicSchema).tags,
          threadId: (formData.fields as TopicSchema).thread,
        },
      });

      return res.status(201).json({ postId: topic.id });
    }
  }
};

export default handleTC;
