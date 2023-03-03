import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { Prisma } from '@prisma/client';
import paginator from "prisma-paginate";
import prisma from "@api/prisma";
import { logger } from "@lib/logger";

let authorSchema = z.object({
    avatar: z.string().url(),
    name: z.string(),
    social: z.string().nullable(),
    id: z.string()
});

const querySchema = z.object({
    page: z.string().transform((value) => parseInt(value))
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        /*if (
            !req.headers.authorization ||
            req.headers.authorization.replace("Bearer ", "") !==
            process.env.PLUGIN_TOKEN
        ) throw createHttpError.Unauthorized();*/

        switch (req.method) {
            case "POST": {
                const data = await authorSchema.parseAsync(req.body);

                const result = await prisma.authors.create({
                    data
                });

                return res.status(201).json(result);
            }
            case "PATCH": {
                const data = await authorSchema.parseAsync(req.body);

                const result = await prisma.authors.update({
                    data: data,
                    where: {
                        id: data.id
                    }
                });

                return res.status(202).json(result);
            }
            case "GET": {
                const query = await querySchema.parseAsync(req.query);
                const paginate = paginator(prisma);

                const page = await paginate.authors.paginate({ where: {} }, {
                    pageIndex: query.page,
                    limit: 10
                });

                return res.status(200).json(page);
            }
            default:
                throw createHttpError.BadRequest();
        }

    } catch (error) {
        if (createHttpError.isHttpError(error)) {
            logger.error(error, error.message);
            return res.status(error.statusCode).json(error);
        }

        if (error instanceof ZodError) {
            const message = fromZodError(error as ZodError);
            logger.error(error);
            return res.status(400).json(message);
        }

        if (error instanceof Prisma.PrismaClientValidationError) {
            logger.error(error);
            return res.status(400).json({
                message: error.message
            });
        }

        const ie = createHttpError.InternalServerError();
        logger.error(error, ie.message);
        return res.status(ie.statusCode).json(ie);
    }
}