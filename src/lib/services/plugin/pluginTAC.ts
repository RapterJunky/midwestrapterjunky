import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";

import prisma from "@api/prisma";

const schema = z.object({
  page: z.coerce.number().positive().min(1).optional().default(1),
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": {
      const { page } = schema.parse(req.query);

      const [topics, meta] = await prisma.threadPost
        .paginate({
          select: {
            name: true,
            locked: true,
            pinned: true,
            id: true,
            tags: true,
            notifyOwner: true,
            thread: {
              select: {
                name: true,
              },
            },
            owner: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        })
        .withPages({
          includePageCount: true,
          page,
          limit: 15,
        });

      return res.status(200).json({
        ...meta,
        result: topics,
      });
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
};

export default handle;
