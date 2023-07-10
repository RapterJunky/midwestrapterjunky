import { NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";
import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import "server-only";

import { logger } from "@lib/logger";

const onError = (error: unknown): NextResponse => {
  if (error instanceof ZodError) {
    const br = createHttpError.BadRequest();
    const data = fromZodError(error);

    logger.error(data.message, error);

    return NextResponse.json(
      {
        message: data.message,
        status: br.statusCode,
        details: data.details,
      },
      { status: br.status, statusText: br.message },
    );
  }

  logger.error(error);

  if (createHttpError.isHttpError(error)) {
    return NextResponse.json(
      {
        message: error.message,
        status: error.statusCode,
        details: [
          {
            message: error?.message ?? error?.cause ?? error.name,
          },
        ],
      },
      {
        status: error.statusCode,
        statusText: error.name,
      },
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    const br = createHttpError.BadRequest();

    return NextResponse.json(
      {
        message: error.message,
        status: br.statusCode,
        details: [],
      },
      { status: br.statusCode, statusText: br.message },
    );
  }

  const ie = createHttpError.InternalServerError();

  return NextResponse.json(
    {
      message: ie.message,
      status: ie.statusCode,
      details: [],
    },
    { status: ie.statusCode, statusText: ie.message },
  );
};

export default onError;
