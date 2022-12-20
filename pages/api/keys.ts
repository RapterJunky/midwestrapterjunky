import createHttpError from "http-errors";
import { z, ZodError } from "zod";
import { fromZodError } from 'zod-validation-error';
import type { NextApiRequest, NextApiResponse } from "next";
import { getKeys, addKeys } from '../../lib/dynamic_keys';

const upsertVaildation = z.array(
    z.object({
        key: z.string().transform(value=>value.toUpperCase()),
        value: z.string()
    })
).nonempty();

const getVaildataion = z.array(z.string().transform(value=>value.toUpperCase())).nonempty();


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if(!req.headers.authorization || req.headers.authorization.replace("Bearer ","") !== process.env.KEYS_TOKEN as string) throw createHttpError.Unauthorized();

        switch (req.method) {
            case "POST":{
                const data = upsertVaildation.parse(req.body);
                const request = await addKeys(data);
                return res.status(201).json(request);
            }
            case "PATCH":{
                const data = upsertVaildation.parse(req.body);
                const request = await addKeys(data);
                return res.status(202).json(request);
            }
            case "GET":{
                const query = req.query.q;
                if(!query) throw createHttpError.BadRequest();
                const keys = Array.isArray(query) ? query : [query];
                const data = getVaildataion.parse(keys);
                const pairs = await getKeys(data);
                return res.status(200).json(pairs);
            }
            default:
                throw createHttpError.MethodNotAllowed();
        }
    } catch (error) {
        console.error(error);
        if(createHttpError.isHttpError(error)) return res.status(error.statusCode).json(error);

        if(error instanceof ZodError) {
            const reason = fromZodError(error);
            const status = createHttpError.BadRequest();
            return res.status(status.statusCode).json({ details: reason.details, message: status.message });
        }

        const ie = createHttpError.InternalServerError();
        return res.status(ie.statusCode).json(ie);
    }
}