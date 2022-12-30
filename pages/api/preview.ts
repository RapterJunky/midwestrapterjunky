import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z, ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
import { logger } from "@lib/logger";

const PreviewTimeWindow = 60 * 60;
const slugValidation = z.string().startsWith("/");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        //Check that the secret matches and that the slug parameter exists (if not, the request should fail)
        if(req.query.secret !== process.env.PREVIEW_TOKEN) throw createHttpError.Unauthorized()

        const slug = slugValidation.parse(req.query.slug);
        
        // fetch headless for data.
        // make sure object exits

        // lasts for an hour.
        res.setPreviewData({},{ maxAge: PreviewTimeWindow, path: slug });

        return res.redirect(slug);
    } catch (error) {
        if(createHttpError.isHttpError(error)) {
            logger.error(error,error.message);
            return res.status(error.statusCode).json(error);
        }
        if(error instanceof ZodError) {
            const status = createHttpError.BadRequest();
            const display = fromZodError(error);
            logger.error(error,display.message);
            return res.status(status.statusCode).json({ message: status.message, details: display.details });
        }

        const ie = createHttpError.InternalServerError();
        logger.error(error,ie.message);
        return res.status(ie.statusCode).json(ie);
    }
}