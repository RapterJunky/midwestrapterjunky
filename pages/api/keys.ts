import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";
import { getKeys, addKeys } from '../../lib/dynamic_keys';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    try {
        if(!req.headers.authorization || req.headers.authorization.replace("Bearer ","") !== process.env.KEYS_TOKEN as string) throw createHttpError.Unauthorized();

        switch (req.method) {
            case "POST":{
                if(!Array.isArray(req.body)) throw createHttpError.BadRequest();
                const request = await addKeys(req.body);
                return res.status(201).json(request);
            }
            case "PATCH":{
                if(!Array.isArray(req.body)) throw createHttpError.BadRequest();
                const request = await addKeys(req.body);
                return res.status(202).json(request);
            }
            case "GET":{
                const query = req.query.q;
                if(!query) throw createHttpError.BadRequest();
                const keys = await getKeys(Array.isArray(query) ? query : [query]);
                return res.status(200).json(keys);
            }
            default:
                throw createHttpError.MethodNotAllowed();
        }
    } catch (error) {
        console.error(error);
        if(createHttpError.isHttpError(error)) return res.status(error.statusCode).json(error);

        const ie = createHttpError.InternalServerError();
        return res.status(ie.statusCode).json(ie);
    }
}