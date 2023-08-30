import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";

import onError from "@api/handleError";
import prisma from "@api/prisma";

const getSchema = z.object({
  sort: z.enum(["latest", "top"]),
  mode: z
    .enum(["suggest", "category", "default"])
    .optional()
    .default("default"),
  tags: z
    .array(z.string().transform((value) => decodeURIComponent(value)))
    .or(z.string().transform((val) => [decodeURIComponent(val)]))
    .optional(),
  categoryId: z.coerce.number().min(1).optional(),
  ignore: z.string().uuid().optional(),
  page: z.coerce.number().min(1).optional().default(1),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    switch (req.method) {
      case "GET": {
        const { sort, page, mode, categoryId, tags, ignore } = getSchema.parse(
          req.query,
        );

        if (mode === "suggest") {
          const data = await prisma.threadPost.findMany({
            where: {
              NOT: ignore
                ? {
                    id: ignore,
                  }
                : undefined,
              tags: {
                array_contains: tags,
              },
            },
            select: {
              id: true,
              name: true,
              locked: true,
              pinned: true,
              tags: true,
              comments: {
                take: 1,
                orderBy: {
                  created: "desc",
                },
                select: {
                  updatedAt: true,
                },
              },
            },
            take: 5,
          });

          return res.status(200).json({
            result: data,
            isLastPage: true,
          });
        }

        if (mode === "category") {
          const [posts, meta] = await prisma.threadPost
            .paginate({
              where: {
                threadId: categoryId,
              },
              select: {
                id: true,
                name: true,
                locked: true,
                pinned: true,
                tags: true,
                comments: {
                  take: 1,
                  orderBy: {
                    created: "desc",
                  },
                  select: {
                    updatedAt: true,
                  },
                },
              },
              orderBy:
                sort === "latest"
                  ? {
                      createdAt: "desc",
                    }
                  : {
                      likes: {
                        _count: "desc",
                      },
                    },
            })
            .withPages({
              includePageCount: true,
              limit: 15,
              page: page,
            });

          return res.status(200).json({ result: posts, ...meta });
        }

        const [posts, meta] = await prisma.threadPost
          .paginate({
            select: {
              id: true,
              name: true,
              locked: true,
              pinned: true,
              tags: true,
              comments: {
                take: 1,
                orderBy: {
                  created: "desc",
                },
                select: {
                  updatedAt: true,
                },
              },
            },
            orderBy:
              sort === "latest"
                ? {
                    createdAt: "desc",
                  }
                : {
                    likes: {
                      _count: "desc",
                    },
                  },
          })
          .withPages({
            includePageCount: true,
            limit: 15,
            page: page,
          });

        return res.status(200).json({ result: posts, ...meta });
      }
      case "POST": {
        throw createHttpError.NotImplemented();
      }
      default:
        throw createHttpError.MethodNotAllowed();
    }
  } catch (error) {
    return onError(error, res);
  }
};

export default handler;
