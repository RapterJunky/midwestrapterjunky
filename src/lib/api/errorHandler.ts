import { fromZodError } from "zod-validation-error";
import type { NextApiResponse } from "next";
import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { logger } from "@lib/logger";

export type ApiErrorResponse = {
  message: string;
  status?: number;
  details?: unknown[] | { message: string }[];
};
/**
 * Pages directory error handler
 * @deprecated
 */
export const handleError = (
  error: unknown,
  res: NextApiResponse<ApiErrorResponse>
) => {
  if (error instanceof ZodError) {
    const data = fromZodError(error);

    logger.error(data.message, error);

    return res.status(400).json({
      message: data.message,
      details: data.details,
    });
  }

  logger.error(error);

  if (error instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ message: error.message });
  }
  if (createHttpError.isHttpError(error)) {
    return res.status(error.statusCode).json({
      message: error.name.replace("Error", ""),
      status: error.statusCode,
      details: [
        {
          message: error?.message ?? error?.cause ?? error.name,
        },
      ],
    });
  }

  const ie = createHttpError.InternalServerError();

  return res.status(ie.statusCode).json(ie);
};
