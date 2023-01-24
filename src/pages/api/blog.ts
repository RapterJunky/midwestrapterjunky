import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { buildClient, LogLevel } from '@datocms/cma-client-node';
import { z, ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
import { logger } from "@lib/logger";
import { DATOCMS_Fetch } from "@lib/gql";
import PagedArticles from "@query/queries/pagedArticles";

const MAX_ITEMS = 5;
const schema = z.string().transform((value,ctx)=>{
    const parsed = parseInt(value);
    if(isNaN(parsed)) return z.NEVER;
    return z.number().gte(0).parse(parsed);
});

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        const page = schema.parse(req.query?.page ?? "0");

        const current = page * MAX_ITEMS;

        const data = await DATOCMS_Fetch(PagedArticles,{ 
            preview: req.preview,
            variables: {
                first: 5,
                skip: current
            }
        });

        // Two Hour wait
        if(!req.preview || process.env.VERCEL_ENV !== "development") res.setHeader("Cache-Control", "public, max-age=7200, immutable");
        return res.status(200).json(data)
    } catch (error: any) {
        if(error instanceof ZodError) {
            const output = fromZodError(error);
            const br = createHttpError.BadRequest();
            logger.info(output,output.message);
            return res.status(br.statusCode).json({ message: br.message, details: output.details });
        }

        logger.error(error,error?.message)
        const ie = createHttpError.InternalServerError();
        return res.status(ie.statusCode).json(ie);
    }
}