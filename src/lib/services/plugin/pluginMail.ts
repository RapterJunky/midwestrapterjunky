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

      const [emails, meta] = await prisma.mailingList.paginate().withPages({
        includePageCount: true,
        page,
        limit: 50,
      });

      return res.status(200).json({
        ...meta,
        result: emails,
      });
    }
    default:
      throw createHttpError.MethodNotAllowed();
  }
};

export default handle;
