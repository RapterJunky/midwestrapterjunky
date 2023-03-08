import type { NextApiRequest, NextApiResponse } from "next";
import { Prisma } from '@prisma/client';
import createHttpError from "http-errors";
import { z, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import paginator from "prisma-paginate";
import prisma from "@api/prisma";
import { logger } from "@lib/logger";
import { strToNum } from "@lib/utils/strToNum";

const getSchema = z.object({
    page: z.string().default("1").transform(strToNum)
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
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case "GET": {
                const { page } = getSchema.parse(req.query);
                const paginate = paginator(prisma.thread);

                const result = await paginate.paginate({}, { limit: 20, page });

                return res.status(200).json(result);
            }
            case "POST": {
                auth(req);
                const { name } = postSchema.parse(req.body);

                const result = await prisma.thread.create({
                    data: {
                        name
                    }
                });

                return res.status(201).json(result);
            }
            case "PATCH": {
                auth(req);
                const { name, id } = patchSchema.parse(req.body);

                const result = await prisma.thread.update({
                    where: {
                        id
                    },
                    data: {
                        name
                    }
                });

                return res.status(200).json(result);
            }
            case "DELETE": {
                auth(req);
                const { id } = deleteSchema.parse(req.body);

                const result = await prisma.thread.delete({
                    where: {
                        id
                    }
                });

                return res.status(200).json(result);
            }
            default:
                throw createHttpError.MethodNotAllowed();
        }
    } catch (error) {
        logger.error(error);
        if (error instanceof ZodError) {
            const data = fromZodError(error);

            return res.status(400).json({
                message: data.message,
                details: data.details
            });
        }
        if (error instanceof Prisma.PrismaClientValidationError) {
            return res.status(400).json({ message: error.message });
        }
        if (createHttpError.isHttpError(error)) {
            return res.status(error.statusCode).json(error);
        }

        const ie = createHttpError.InternalServerError();

        return res.status(ie.statusCode).json(ie);
    }
}

