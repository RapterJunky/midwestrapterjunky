import { handleError } from "@/lib/api/errorHandler";
import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/getSession";
import DELETE from "@service/posts/DELETE";
import POST from "@service/posts/POST";
import GET from "@service/posts/GET";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getSession(req, res, false);
    switch (req.method) {
      case "GET":
        return await GET(req, res, session);
      case "POST":
        return await POST(req, res, session);
      case "DELETE":
        return await DELETE(req, res, session);
      default:
        throw createHttpError.MethodNotAllowed();
    }
  } catch (error) {
    handleError(error, res);
  }
};

export default handle;
