import type { NextApiRequest, NextApiResponse } from "next";
import onError from "@api/handleError";
import createHttpError from "http-errors";

import getAuthSession from "@api/getAuthSession";
import DELETE from "@service/posts/DELETE";
import POST from "@service/posts/POST";
import GET from "@service/posts/GET";

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = await getAuthSession({ ctx: { req, res } });
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
    onError(error, res);
  }
};

export default handle;
