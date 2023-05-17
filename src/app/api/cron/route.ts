import { type NextRequest, NextResponse } from "next/server";
import createHttpError from "http-errors";
import { z } from "zod";

import ratelimit from "@api/rateLimit";
import { logger } from "@lib/logger";
import onError from "@api/onError";
import prisma from "@api/prisma";

const requests = z.enum(["session"]);

export const GET = async (request: NextRequest) => {
  try {
    const { success } = await ratelimit(request?.ip);
    if (!success) throw createHttpError.TooManyRequests();

    const params = new URL(request.url).searchParams;
    const type = requests.parse(params.get("type"));

    switch (type) {
      case "session": {
        const expiredTokens = await prisma.verificationToken.deleteMany({
          where: {
            expires: {
              lte: new Date(),
            },
          },
        });
        logger.info(expiredTokens, "Removed Expired Tokens");
        return NextResponse.json(expiredTokens, { status: 200 });
      }
    }
  } catch (error) {
    return onError(error);
  }
};