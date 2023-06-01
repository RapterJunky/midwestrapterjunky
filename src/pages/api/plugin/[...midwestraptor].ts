import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";

import handleCategory from "@service/plugin/pluginCategory";
import handleFlags from "@service/plugin/pluginConfigCat";
import handleAuthors from "@service/plugin/pluginAuthors";
import handleReports from "@service/plugin/pluginReports";
import handleImages from "@service/plugin/pluginImages";
import handleSquare from "@service/plugin/pluginSquare";
import handleUsers from "@service/plugin/pluginUser";
import handleMail from "@service/plugin/pluginMail";
import handleTAC from "@service/plugin/pluginTAC";

import { handleError } from "@api/errorHandler";

const allowedRoutes = z
  .array(
    z.enum([
      "authors",
      "reports",
      "square",
      "category",
      "flags",
      "mail",
      "tac",
      "users",
      "images"
    ])
  )
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
      case "category":
        return await handleCategory(req, res);
      case "square":
        return await handleSquare(req, res);
      case "flags":
        return await handleFlags(req, res);
      case "mail":
        return await handleMail(req, res);
      case "tac":
        return await handleTAC(req, res);
      case "users":
        return await handleUsers(req, res);
      case "images":
        return await handleImages(req, res);
      default:
        throw createHttpError.BadRequest();
    }
  } catch (error) {
    return handleError(error, res);
  }
}
