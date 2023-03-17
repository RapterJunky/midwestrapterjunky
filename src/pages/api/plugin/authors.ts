import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import prisma from "@api/prisma";
import { handleError } from "@api/errorHandler";
import { strToNum } from "@lib/utils/strToNum";

let authorSchema = z.object({
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
  page: z.string().transform(strToNum),
});

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (
      !req.headers.authorization ||
      req.headers.authorization.replace("Bearer ", "") !==
        process.env.PLUGIN_TOKEN
    )
      throw createHttpError.Unauthorized();

    switch (req.method) {
      case "POST": {
        const data = await authorSchema.parseAsync(req.body);

        const result = await prisma.authors.create({
          data,
        });

        return res.status(201).json(result);
      }
      case "PATCH": {
        const data = await authorSchema.parseAsync(req.body);

        const result = await prisma.authors.update({
          data: data,
          where: {
            id: data.id,
          },
        });

        return res.status(202).json(result);
      }
      case "GET": {
        const { page } = await querySchema.parseAsync(req.query);

        const [authors, meta] = await prisma.authors.paginate().withPages({
          page,
          limit: 10,
          includePageCount: true,
        });

        return res.status(200).json({ result: authors, ...meta });
      }
      case "DELETE": {
        const query = await z.object({ id: z.string() }).parseAsync(req.body);

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
  } catch (error) {
    handleError(error, res);
  }
}
