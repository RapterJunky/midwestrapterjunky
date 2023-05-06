import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";
import { getKeys, addKeys, dropKeys } from "@lib/dynamic_keys";
import { handleError } from "@api/errorHandler";

const upsertVaildation = z
  .array(
    z.object({
      key: z.string().transform((value) => value.toUpperCase()),
      value: z.string(),
    })
  )
  .nonempty();

const getVaildataion = z
  .array(z.string().transform((value) => value.toUpperCase()))
  .nonempty();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (
      !req.headers.authorization ||
      req.headers.authorization.replace("Bearer ", "") !==
      process.env.KEYS_TOKEN
    )
      throw createHttpError.Unauthorized();

    switch (req.method) {
      case "POST": {
        const data = upsertVaildation.parse(req.body);
        const request = await addKeys(data);
        return res.status(201).json(request);
      }
      case "PATCH": {
        const data = upsertVaildation.parse(req.body);
        const request = await addKeys(data);
        return res.status(202).json(request);
      }
      case "GET": {
        const query = req.query.q;
        if (!query) throw createHttpError.BadRequest();
        const keys = Array.isArray(query) ? query : [query];
        const data = getVaildataion.parse(keys);
        const pairs = await getKeys(data);
        return res.status(200).json(pairs);
      }
      case "DELETE": {
        const { keys } = z.object({ keys: getVaildataion }).parse(req.query);

        const count = await dropKeys(keys);

        return res.status(200).json({ count });
      }
      default:
        throw createHttpError.MethodNotAllowed();
    }
  } catch (error) {
    return handleError(error, res);
  }
}
