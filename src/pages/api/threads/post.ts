import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "node:crypto";
import createHttpError from "http-errors";
import { z } from "zod";

import prisma from "@api/prisma";
import { strToNum } from "@utils/strToNum";
import { getSession } from "@lib/getSession";
import { handleError } from "@api/errorHandler";
import { applyRateLimit } from "@api/rateLimiter";

const dastSchema = z.object({
  value: z.object({
    schema: z.literal("dast"),
    document: z.object({
      type: z.literal("root"),
      children: z.array(z.any()),
    }),
  }),
  links: z
    .array(z.object({ __typename: z.string(), id: z.string() }).passthrough())
    .optional(),
  blocks: z
    .array(z.object({ __typename: z.string(), id: z.string() }).passthrough())
    .optional(),
});

const getSchema = z.object({
  page: z.string().default("1").transform(strToNum),
  thread: z
    .string({ required_error: "Thread query param is required." })
    .transform(strToNum),
  search: z
    .string()
    .optional()
    .transform((value) => {
      if (value) return decodeURIComponent(value);
      return value;
    }),
});

const deleteSchema = z.object({
  id: z.string().uuid(),
});

const reportSchema = deleteSchema.extend({
  reason: z.string(),
});

const patchSchema = deleteSchema.extend({
  name: z.string().optional(),
  content: dastSchema,
});

const postSchema = z.object({
  name: z.string(),
  threadId: z.number().positive(),
  content: dastSchema,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const { page, thread, search } = getSchema.parse(req.query);

        const [posts, meta] = await prisma.threadPost
          .paginate({
            where: {
              threadId: thread,
              AND: search
                ? {
                    name: {
                      contains: search,
                    },
                  }
                : undefined,
            },
            select: {
              name: true,
              created: true,
              id: true,
              owner: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: {
              created: "asc",
            },
          })
          .withPages({ limit: 20, page });

        return res.status(200).json({ result: posts, ...meta });
      }
      case "POST": {
        await applyRateLimit(req, res);
        const session = await getSession(req, res);

        if (req.headers["x-type-report"] === "true") {
          const { id, reason } = reportSchema.parse(req.body);

          console.log(
            `post ${id} was reported by ${session.user.id} for ${reason}`
          );

          return res.status(201).json({ message: "Reported" });
        }

        const { name, threadId, content } = postSchema.parse(req.body);

        await prisma.thread.exists(
          {
            where: {
              id: threadId,
            },
          },
          createHttpError.NotFound("Provided thread does not exist.")
        );

        const result = await prisma.threadPost.create({
          data: {
            id: randomUUID(),
            name,
            ownerId: session.user.id,
            threadId,
            content,
          },
        });

        return res.status(201).json(result);
      }
      case "PATCH": {
        await applyRateLimit(req, res);
        const session = await getSession(req, res);
        const { name, id, content } = patchSchema.parse(req.body);

        if (!name && !content)
          return res.status(200).json({ message: "No Change" });

        await prisma.threadPost.exists(
          {
            where: {
              id,
              AND: {
                ownerId: session.user.id,
              },
            },
          },
          createHttpError.NotFound()
        );

        const result = await prisma.threadPost.update({
          where: {
            id,
          },
          data: {
            name,
            content,
          },
        });

        return res.status(200).json(result);
      }
      case "DELETE": {
        await applyRateLimit(req, res);
        const session = await getSession(req, res);
        const { id } = deleteSchema.parse(req.body);

        await prisma.threadPost.exists(
          {
            where: {
              id,
              AND: {
                ownerId: session.user.id,
              },
            },
          },
          createHttpError.NotFound()
        );

        const result = await prisma.threadPost.delete({
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
