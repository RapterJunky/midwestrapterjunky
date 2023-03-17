import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";
import prisma from "@api/prisma";
import { strToNum } from "@lib/utils/strToNum";
import { handleError } from "@api/errorHandler";

const getSchema = z.object({
  page: z.string().default("1").transform(strToNum),
});
const postSchema = z.object({
  name: z.string(),
});
const patchSchema = z.object({
  name: z.string(),
  id: z.number().positive(),
});
const deleteSchema = z.object({
  id: z.number().positive(),
});

const auth = (req: NextApiRequest) => {
  if (
    !req.headers.authorization ||
    req.headers.authorization.replace("Bearer ", "") !==
      process.env.PLUGIN_TOKEN
  )
    throw createHttpError.Unauthorized();
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET": {
        const { page } = getSchema.parse(req.query);

        const [threads, meta] = await prisma.thread
          .paginate()
          .withPages({ limit: 20, page });

        return res.status(200).json({
          result: threads,
          ...meta,
        });
      }
      case "POST": {
        auth(req);
        const { name } = postSchema.parse(req.body);

        const result = await prisma.thread.create({
          data: {
            name,
          },
        });

        return res.status(201).json(result);
      }
      case "PATCH": {
        auth(req);
        const { name, id } = patchSchema.parse(req.body);

        const result = await prisma.thread.update({
          where: {
            id,
          },
          data: {
            name,
          },
        });

        return res.status(200).json(result);
      }
      case "DELETE": {
        auth(req);
        const { id } = deleteSchema.parse(req.body);

        const result = await prisma.thread.delete({
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
