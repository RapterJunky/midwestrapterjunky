import type { NextApiResponse } from "next";
import { Prisma } from "@prisma/client";
import createHttpError from "http-errors";
import multer from "multer";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "@lib/logger";

export const handleError = (error: unknown, res: NextApiResponse) => {
  logger.error(error);

  if (error instanceof ZodError) {
    const data = fromZodError(error);

    return res.status(400).json({
      message: data.message,
      details: data.details,
    });
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ message: error.message });
  }
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json(error);
  }

  const ie = createHttpError.InternalServerError();

  if (error instanceof multer.MulterError) {
    return res.status(ie.statusCode).json(ie);
  }

  return res.status(ie.statusCode).json(ie);
};
