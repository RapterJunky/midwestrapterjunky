import { NextResponse } from "next/server";
import { logger } from "@lib/logger";
import onError from "@api/onError";
import prisma from "@api/prisma";

export const GET = async () => {
  try {
    const expiredTokens = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lte: new Date(),
        },
      },
    });
    logger.info(expiredTokens, "Removed Expired Tokens");
    return NextResponse.json(expiredTokens, { status: 200 });
  } catch (error) {
    return onError(error);
  }
};
