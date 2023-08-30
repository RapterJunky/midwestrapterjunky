import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import prisma from "@api/prisma";

const authorSchema = z.object({
  avatar: z.string().url(),
  name: z.string(),
  social: z
    .object({
      link: z.string().url(),
      user: z.string(),
    })
    .nullable()
    .transform((value) => {
      if (!value) return Prisma.DbNull;
      return value;
    }),
  id: z.string().uuid(),
});

const querySchema = z.object({
  page: z.coerce.number().positive().min(1).optional().default(1),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  switch (req.method) {
    case "POST": {
      const data = authorSchema.parse(req.body);

      const result = await prisma.authors.create({
        data,
      });

      return res.status(201).json(result);
    }
    case "PATCH": {
      const data = authorSchema.parse(req.body);

      const result = await prisma.authors.update({
        data: data,
        where: {
          id: data.id,
        },
      });

      return res.status(202).json(result);
    }
    case "GET": {
      const { page } = querySchema.parse(req.query);

      const [authors, meta] = await prisma.authors.paginate().withPages({
        page,
        limit: 10,
        includePageCount: true,
      });

      return res.status(200).json({ result: authors, ...meta });
    }
    case "DELETE": {
      const query = z.object({ id: z.string() }).parse(req.query);

      await prisma.authors.delete({
        where: {
          id: query.id,
        },
      });

      return res.status(201).json({ ok: true });
    }
    default:
      throw createHttpError.BadRequest();
  }
}
