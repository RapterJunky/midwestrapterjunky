import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import prisma from "@api/prisma";
import createHttpError from "http-errors";

const schema = z.object({
    page: z.coerce.number().optional().default(1)
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    switch (req.method) {
        case "GET": {
            const { page } = schema.parse(req.query);

            const [categires, meta] = await prisma.thread.paginate({}).withPages({
                limit: 15,
                includePageCount: true,
                page
            });

            return res.status(200).json({ ...meta, result: categires });
        }
        default:
            throw createHttpError.MethodNotAllowed();
    }
}