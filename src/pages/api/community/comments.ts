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

const postRoot = z.object({
  type: z.enum(["like", "comment", "report"])
})

const createCommentSchema = postRoot.extend({
  data: z.array(z.object({ type: z.string() }).passthrough()).transform(e => slateToDast(e as Descendant[], {})),
  parentCommentId: z.string().uuid().nullable().optional(),
  postId: z.string().uuid().nonempty(),
});

const idSchema = postRoot.extend({
  id: z.string().uuid(),
});

const createReportSchema = idSchema.extend({
  reason: z.string().nonempty(),
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
        const session = await getSession(req, res, false);

        const [comments, meta] = await prisma.comment
          .paginate({
            where: {
              threadPostId: post,
              parentCommentId: null
            },
            select: {
              id: true,
              content: true,
              created: true,
              _count: {
                select: {
                  likes: true
                }
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

        const likes = session ? await prisma.like.findMany({
          where: {
            userId: session?.user.id,
            commentId: { in: comments.map(value => value.id) }
          }
        }) : [];

        let result = [];
        for (const comment of comments) {
          const { _count, ...commentFields } = comment;
          result.push({
            ...commentFields,
            likedByMe: !!likes.find(like => like.commentId === comment.id),
            likeCount: _count.likes
          });
        }

        return res.status(200).json({ result: result, ...meta });
      }
      case "POST": {
        await applyRateLimit(req, res);
        const session = await getSession(req, res);

        const { type } = postRoot.parse(req.body);

        if (type === "report") {
          const { id, reason } = createReportSchema.parse(req.body);

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

        if (type === "like") {
          const { id } = idSchema.parse(req.body);

          const data = await prisma.like.create({
            data: {
              id: `${session.user.id}${id}`,
              type: "Comment",
              userId: session.user.id,
              commentId: id
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
                      likes: true
                    }
                  },
                  owner: {
                    select: {
                      image: true,
                      id: true,
                      name: true,
                    },
                  },
                }
              }
            }
          });

          if (!data.comment) throw createHttpError.InternalServerError("Failed to get comment");

          const { _count, ...comment } = data.comment;

          return res.status(200).json({
            ...comment,
            likedByMe: true,
            likeCount: _count.likes
          })
        }

        const { data, parentCommentId, postId } = createCommentSchema.parse(
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

        return res.status(201).json({
          ...result,
          likedByMe: false,
          likeCount: 0
        });
      }
      case "DELETE": {
        await applyRateLimit(req, res);
        const session = await getSession(req, res);
        const { id, type } = idSchema.parse(req.body);

        if (type === "like") {

          const data = await prisma.like.delete({
            where: {
              id: `${session.user.id}${id}`
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
                      likes: true
                    }
                  },
                  owner: {
                    select: {
                      image: true,
                      id: true,
                      name: true,
                    },
                  },
                }
              }
            }
          });
          if (!data.comment) throw createHttpError.InternalServerError("Failed to get comment");
          const { _count, ...comment } = data.comment;
          return res.status(200).json({
            ...comment,
            likedByMe: false,
            likeCount: _count.likes - 1
          });
        }
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
