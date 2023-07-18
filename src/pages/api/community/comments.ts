import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";

import { applyRateLimit } from "@api/rateLimiter";
import onError from "@api/handleError";
import DELETE from "@service/comments/DELETE";
import getAuthSession from "@api/getAuthSession";
import POST from "@service/comments/POST";
import GET from "@service/comments/GET";

//https://kittygiraudel.com/2022/05/16/rate-limit-nextjs-api-routes/
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const session = await getAuthSession({ throwOnNull: false, ctx: { req, res } });
    switch (req.method) {
      case "GET":
        return await GET(req, res, session);
      case "POST": {
        await applyRateLimit(req, res);
        return await POST(req, res, session);
      }
      case "DELETE": {
        await applyRateLimit(req, res);
        return await DELETE(req, res, session);
      }
      default:
        throw createHttpError.MethodNotAllowed();
    }
  } catch (error) {
    onError(error, res);
  }
}
