import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";

import prisma from "@api/prisma";

const schema = z.object({
  page: z.coerce.number().optional().default(1),
});

const createCategory = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  tags: z.array(z.string().min(3).max(15)).max(6),
  image: z.string().url(),
});

const patchSchema = createCategory.extend({
  id: z.number().positive().min(1),
});

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET": {
      const { page } = schema.parse(req.query);

      const [categires, meta] = await prisma.thread.paginate().withPages({
        limit: 15,
        includePageCount: true,
        page,
      });

      return res.status(200).json({ ...meta, result: categires });
    }
    case "POST": {
      const { tags, name, description, image } = createCategory.parse(req.body);

      const data = await prisma.thread.create({
        data: {
          description,
          image,
          tags,
          name,
        },
      });

      await Promise.all([
        res.revalidate("/community"),
        res.revalidate("/community/create-topic")
      ])

      return res.status(201).json(data);
    }
    case "PATCH": {
      const { id, tags, name, description, image } = patchSchema.parse(
        req.body
      );

      const data = await prisma.thread.update({
        where: {
          id,
        },
        data: {
          tags,
          name,
          description,
          image,
        },
      });

      await Promise.all([
        res.revalidate("/community"),
        res.revalidate("/community/create-topic")
      ])

      return res.status(200).json(data);
    }
    case "DELETE": {
      const { id } = z
        .object({ id: z.number().positive().min(1) })
        .parse(req.body);

      const data = await prisma.thread.delete({
        where: {
          id,
        },
      });

      await Promise.all([
        res.revalidate("/community"),
        res.revalidate("/community/create-topic")
      ])

      return res.status(200).json(data);
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
};

export default handle;
