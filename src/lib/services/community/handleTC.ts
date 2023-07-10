import type { NonTextNode } from "datocms-structured-text-slate-utils";
import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import type { Session } from "next-auth";

import parseForm, {
  type TopicSchema,
  type CommentSchema,
  commentSchema,
  topicSchema,
} from "@lib/utils/editor/parseForm";
import { slateToDast } from "@lib/utils/editor/slateToDast";
import { logger } from "@lib/logger";
import sendMail from "@api/sendMail";
import prisma from "@api/prisma";

const EMAIL_TEMPLTE_ID = "d-09d6805d0013445eb03fa020c5fabb7c";

/**
 * Handle updating post/comments with new slate content.
 * handle uploading new image and ignoring old images
 */
const handleTC = async (
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  type: "post" | "comment",
) => {
  const schema = type === "comment" ? commentSchema : topicSchema;
  const formData = await parseForm(req, req.method as "PATCH" | "POST", schema);

  // check dast before having to handle image uploading.
  const dast = slateToDast(formData.fields.message as NonTextNode[]);
  if (!dast) throw createHttpError.BadRequest("Failed to vaildate dast");

  if (!dast.blocks) dast.blocks = [];

  dast.blocks.push(...formData.imagesBlocks);

  if (req.method === "PATCH")
    switch (type) {
      case "comment": {
        const comment = await prisma.comment.update({
          where: {
            id: formData.fields.editId,
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
            id: formData.fields.editId,
          },
          data: {
            notifyOwner: (formData.fields as TopicSchema).notification,
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
          threadPost: {
            select: {
              notifyOwner: true,
              id: true,
              name: true,
              owner: {
                select: {
                  email: true,
                },
              },
            },
          },
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

      if (comment.threadPost.notifyOwner) {
        logger.info("Sending notification");
        if (comment.threadPost.owner.email)
          await sendMail(
            {
              to: comment.threadPost.owner.email,
              templete: {
                id: EMAIL_TEMPLTE_ID,
                data: {
                  topic_title: comment.threadPost.name,
                  topic_link: `http${
                    process.env.VERCEL_ENV !== "development" ? "s" : ""
                  }://${process.env.VERCEL_URL}/community/p/${
                    comment.threadPost.id
                  }`,
                },
              },
            },
            comment.threadPost.id,
          );
      }

      delete (comment as Partial<typeof comment>).threadPost;

      return res.status(201).json({
        ...comment,
        likedByMe: false,
        likeCount: 0,
      });
    }
    case "post": {
      const topic = await prisma.threadPost.create({
        data: {
          notifyOwner: (formData.fields as TopicSchema).notification,
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
