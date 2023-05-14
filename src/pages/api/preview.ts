import type { NextApiRequest, NextApiResponse } from "next";
import createHttpError from "http-errors";
import { z } from "zod";
import { handleError } from "@api/errorHandler";
import { logger } from "@/lib/logger";

const slugValidation = z.string().startsWith("/");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    //Check that the secret matches and that the slug parameter exists (if not, the request should fail)
    if (req.query.secret !== process.env.PREVIEW_TOKEN)
      throw createHttpError.Unauthorized();

    const slug = slugValidation.parse(req.query.slug);

    logger.info("Enabling draft mode");

    res.setDraftMode({ enable: true });

    return res.redirect(308, slug);
  } catch (error) {
    return handleError(error, res);
  }
}
