import { NextResponse } from "next/server";
import createHttpError from "http-errors";

import getAuthSession from "@api/getAuthSession";
import onError from "@api/handleError";
import { logger } from "@lib/logger";
import prisma from "@api/prisma";

export const dynamic = 'force-dynamic';

export const GET = async () => {
  try {
    const session = await getAuthSession({ throwOnNull: true });

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: {
          select: {
            provider: true,
            type: true,
            providerAccountId: true,
          },
        },
      },
    });

    if (!user) throw createHttpError.NotFound("Failed to find user account");

    return NextResponse.json(user);
  } catch (error) {
    return onError(error);
  }
};

export const DELETE = async () => {
  try {
    const session = await getAuthSession({ throwOnNull: true });

    const result = await prisma.user.delete({
      where: {
        id: session.user.id,
      },
    });

    logger.info(result, "Deleted User account");

    return NextResponse.json({
      status: 200,
      message: "account deleted",
      date: new Date(),
    });
  } catch (error) {
    return onError(error);
  }
};
