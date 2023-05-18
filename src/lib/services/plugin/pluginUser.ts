import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";

import prisma from "@api/prisma";

const schema = z.object({
  page: z.coerce.number().min(0).optional().default(1),
  limit: z.coerce.number().gte(10).lte(50).optional().default(50),
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": {
      const { page, limit } = schema.parse(req.query);

      const [user, meta] = await prisma.user
        .paginate({
          select: {
            email: true,
            name: true,
            id: true,
            banned: true,
          },
        })
        .withPages({
          includePageCount: true,
          page: page + 1,
          limit,
        });

      return res.status(200).json({
        ...meta,
        result: user,
      });
    }
    case "PATCH": {
      const { id, ban } = z
        .object({ id: z.string().cuid(), ban: z.number().min(0).max(2) })
        .parse(req.body);

      const data = await prisma.user.update({
        where: {
          id,
        },
        data: {
          banned: ban,
        },
      });

      return res.status(200).json({
        email: data.email,
        name: data.name,
        id: data.id,
        banned: data.banned,
      });
    }
    case "DELETE": {
      const { id } = z.object({ id: z.string().cuid() }).parse(req.query);

      await prisma.user.delete({
        where: {
          id,
        },
      });

      return res.status(200).json({ ok: true, now: new Date().getTime() });
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
};

export default handle;
