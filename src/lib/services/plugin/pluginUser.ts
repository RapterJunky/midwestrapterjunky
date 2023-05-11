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
          page,
          limit: 50,
        });

      return res.status(200).json({
        ...meta,
        result: user,
      });
    }
    case "PATCH": {
      const { id, ban } = z
        .object({ id: z.string().cuid(), ban: z.boolean() })
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
