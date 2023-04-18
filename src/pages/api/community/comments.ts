import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import createHttpError from "http-errors";
import { z } from "zod";

import prisma from "@api/prisma";
import { getSession } from "@lib/getSession";
import { handleError } from "@api/errorHandler";
import { applyRateLimit } from "@api/rateLimiter";
import { slateToDast } from "@lib/utils/slateToDast";
import type { Descendant } from 'slate';

const getSchema = z.object({
  post: z.string().uuid(),
  page: z.coerce.number().positive().min(1).optional().default(1),
});
const postSchema = z.object({
  data: z.array(z.object({ type: z.string() }).passthrough()).transform(e => slateToDast(e as Descendant[], {})),
  parentCommentId: z.string().uuid().nullable().optional(),
  postId: z.string().uuid().nonempty(),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

const reportSchema = deleteSchema.extend({
  reason: z.string(),
});

//https://kittygiraudel.com/2022/05/16/rate-limit-nextjs-api-routes/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const { post, page } = getSchema.parse(req.query);

        const [comments, meta] = await prisma.comment
          .paginate({
            where: {
              threadPostId: post,
            },
            select: {
              id: true,
              content: true,
              created: true,
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

        return res.status(200).json({ result: comments, ...meta });
      }
      case "POST": {
        await applyRateLimit(req, res);
        const session = await getSession(req, res);

        if (req.headers["x-type-report"] === "true") {
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

        const { data, parentCommentId, postId } = postSchema.parse(
          req.body
        );

        await prisma.threadPost.exists(
          {
            where: {
              id: postId,
            },
          },
          createHttpError.NotFound("Given post id was not found")
        );

        if (parentCommentId) {
          await prisma.comment.exists(
            {
              where: {
                id: parentCommentId,
              },
            },
            createHttpError.NotFound("Given parent comment id was not found")
          );
        }

        if (!data) throw createHttpError.InternalServerError("Failed to transform message");

        const dast: PrismaJson.Dast = {
          blocks: [],
          value: data
        }

        const result = await prisma.comment.create({
          data: {
            id: randomUUID(),
            content: dast,
            ownerId: session.user.id,
            threadPostId: postId,
            parentCommentId,
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

        return res.status(201).json(result);
      }
      case "DELETE": {
        await applyRateLimit(req, res);
        const session = await getSession(req, res);
        const { id } = deleteSchema.parse(req.body);

        await prisma.comment.exists(
          {
            where: {
              id,
              AND: {
                ownerId: session.user.id,
              },
            },
          },
          createHttpError.NotFound("No comment with given owner exists.")
        );

        const result = await prisma.comment.delete({
          where: {
            id,
          },
        });
        return res.status(200).json(result);
      }
      default:
        throw createHttpError.MethodNotAllowed();
    }
  } catch (error) {
    handleError(error, res);
  }
}
