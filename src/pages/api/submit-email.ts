import { Prisma } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import prisma from "@lib/prisma";
import { logger } from "@lib/logger";

const defaultResponse =
  "The Server was unable to add the email to the mailing list.";
const emailValidator = z.object({
  email: z.string().email(),
});

const formatRedirect = (res: NextApiResponse, ok: boolean, error?: string) => {
  //https://stackoverflow.com/questions/72924162/next-js-error-405-method-not-allowed-on-redirect-after-form-submission-post
  return res.redirect(
    301,
    `/submited?ok=${ok}${error ? `${error}=${encodeURIComponent(error)}` : ""}`
  );
};

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") return res.redirect(301, "/");

    const body = emailValidator.parse(req.body);

    await prisma.mailingList.create({
      data: {
        email: body.email,
      },
    });

    return formatRedirect(res, true);
  } catch (error: any) {
    if (error instanceof ZodError) {
      const status = fromZodError(error);
      logger.error(status, status.message);
      return formatRedirect(res, false, status.message);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(error, "Database Error");
      switch (error.code) {
        case "P2002":
          return formatRedirect(
            res,
            false,
            `${req.body.email} has already been added to the mailing list.`
          );
        default:
          return formatRedirect(res, false, defaultResponse);
      }
    }

    logger.error(error, "Unkown Error");

    return formatRedirect(res, false, defaultResponse);
  }
}
