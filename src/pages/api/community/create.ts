import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from 'zod';

import { applyRateLimit } from "@api/rateLimiter";
import { handleError } from "@api/errorHandler";
import { getSession } from "@lib/getSession";
import PATCH from "@service/community/PATCH";
import POST from "@service/community/POST";
import GET from "@service/community/GET";

export const config = {
    api: {
        bodyParser: false
    }
}

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (!req.method || !["POST", "PATCH", "GET"].includes(req.method)) throw createHttpError.MethodNotAllowed();
        const contentType = z.enum(["post", "comment"]).parse(req.headers["x-type-create"]);

        await applyRateLimit(req, res);
        const session = await getSession(req, res);

        switch (req.method) {
            case "POST": {
                if (!req.headers["content-type"]?.startsWith("multipart/form-data")) throw createHttpError.BadRequest("Bad Content Type");
                return await POST(req, res, session, contentType);
            }
            case "PATCH": {
                if (!req.headers["content-type"]?.startsWith("multipart/form-data")) throw createHttpError.BadRequest("Bad Content Type");
                return await PATCH(req, res, session, contentType);
            }
            case "GET": {
                return await GET(req, res, session, contentType);
            }
            default:
                throw createHttpError.MethodNotAllowed();
        }
    } catch (error) {
        return handleError(error, res);
    }
}

export default handle;