import { handleError } from "@/lib/api/errorHandler";
import createHttpError from "http-errors";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import handleAuthors from "@api/routes/pluginAuthors";
import handleReports from "@api/routes/pluginReports";
import handleSquare from "@api/routes/pluginSquare";

const allowedRoutes = z
  .array(z.enum(["authors", "reports", "square"]))
  .describe("Allowed api paths")
  .max(1);

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const path = allowedRoutes.safeParse(req.query.midwestraptor);
    if (!path.success) throw new createHttpError.NotFound("Invaild path");
    const id = path.data.at(0);

    switch (id) {
      case "authors":
        return await handleAuthors(req, res);
      case "reports":
        return await handleReports(req, res);
      case "square":
        return await handleSquare(req, res);
      default:
        throw createHttpError.BadRequest();
    }
  } catch (error) {
    return handleError(error, res);
  }
}
