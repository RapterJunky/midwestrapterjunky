import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";

import prisma from "@api/prisma";

const getSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["Comment", "Post"]).optional(),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
  page: z.coerce.number().positive().min(1).optional().default(1),
});

const deleteSchema = z.object({
  id: z.number().positive(),
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": {
      const { search, order, page, type } = getSchema.parse(req.query);

      const [reports, meta] = await prisma.report
        .paginate({
          where: {
            reason: {
              contains: search,
            },
            type,
          },
          include: {
            comment: {
              include: {
                owner: true,
              },
            },
            owner: true,
            post: {
              include: {
                owner: true,
              },
            },
          },
          orderBy: {
            created: order,
          },
        })
        .withPages({ page, limit: 20, includePageCount: true });

      return res.status(200).json({ ...meta, result: reports });
    }
    case "DELETE": {
      const { id } = deleteSchema.parse(req.body);

      await prisma.report.delete({ where: { id } });

      return res.status(200).json({ message: "ok" });
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
};

export default handle;
