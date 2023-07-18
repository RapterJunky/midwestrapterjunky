import { fromZodError } from "zod-validation-error";
import type { NextApiResponse } from "next";
import { NextResponse } from "next/server";
import createHttpError from "http-errors";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { logger } from "@lib/logger";

export type ApiErrorResponse = {
    message: string;
    status?: number;
    details?: unknown[] | { message: string }[];
};

function onError(error: unknown, res: NextApiResponse): void;
function onError(error: unknown): NextResponse<ApiErrorResponse>;
function onError(error: unknown, res?: NextApiResponse): NextResponse<ApiErrorResponse> | void {
    if (error instanceof ZodError) {
        const badRequest = createHttpError.BadRequest();
        const zodError = fromZodError(error);

        logger.error(zodError.message, error);

        const response: ApiErrorResponse = {
            message: zodError.message,
            status: badRequest.statusCode,
            details: zodError.details
        }

        if (res) return res.status(badRequest.statusCode).json(response);
        return NextResponse.json(response, { status: badRequest.statusCode });
    }

    logger.error(error);

    if (createHttpError.isHttpError(error)) {
        const response: ApiErrorResponse = {
            message: error.message,
            status: error.statusCode,
            details: []
        }

        if (res) return res.status(error.statusCode).json(response);
        return NextResponse.json(response, { status: error.statusCode });
    }

    /*
        exception if validation fails
    */
    if (error instanceof Prisma.PrismaClientValidationError) {
        const badRequest = createHttpError.BadRequest();
        const response: ApiErrorResponse = {
            message: error.message,
            status: badRequest.statusCode,
            details: []
        }
        if (res) return res.status(badRequest.statusCode).json(response);
        return NextResponse.json(response, { status: badRequest.statusCode });
    }
    /*
        exception if the query engine returns a known error related to the request - for example, a unique constraint violation.
    */
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        const badRequest = createHttpError.BadRequest();
        const response: ApiErrorResponse = {
            message: error.message,
            status: badRequest.statusCode,
            details: [{ code: error.code }, error.meta]
        }
        if (res) return res.status(badRequest.statusCode).json(response);
        return NextResponse.json(response, { status: badRequest.statusCode });
    }

    const internalError = createHttpError.InternalServerError();
    const response: ApiErrorResponse = {
        message: internalError.message,
        status: internalError.statusCode,
        details: []
    }

    if (res) return res.status(internalError.statusCode).json(response);
    return NextResponse.json(response, { status: internalError.statusCode });
}

export default onError;